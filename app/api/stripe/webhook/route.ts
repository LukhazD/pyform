import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Subscription from "@/models/Subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-08-16",
    typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectMongo();

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.mode === "subscription" && session.customer_email) {
                    const subscriptionId = session.subscription as string;
                    const customerId = session.customer as string;

                    // Get subscription details from Stripe
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = stripeSubscription.items.data[0]?.price.id;

                    // Find user by email
                    let user = await User.findOne({ email: session.customer_email });

                    if (!user) {
                        try {
                            // Create new user from Stripe email
                            user = await User.create({
                                email: session.customer_email,
                                name: session.customer_details?.name || session.customer_email?.split("@")[0],
                                image: `https://ui-avatars.com/api/?name=${session.customer_details?.name || "User"}&background=random`,
                            });
                            console.log(`[WEBHOOK] Created new user for email: ${session.customer_email}`);
                        } catch (err) {
                            console.error(`[WEBHOOK] Error creating user: ${err}`);
                            // If user creation fails, we can't continue syncing
                            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
                        }
                    }

                    if (user) {
                        // 1. Create/Update Subscription document (source of truth)
                        await Subscription.findOneAndUpdate(
                            { userId: user._id },
                            {
                                userId: user._id,
                                stripeSubscriptionId: subscriptionId,
                                stripePriceId: priceId,
                                status: "active",
                                tier: "pro",
                                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                            },
                            { upsert: true, new: true }
                        );

                        // 2. Sync key fields to User (for fast auth)
                        await User.findByIdAndUpdate(user._id, {
                            stripeCustomerId: customerId,
                            stripeSubscriptionId: subscriptionId,
                            stripePriceId: priceId,
                            subscriptionTier: "pro",
                            subscriptionStatus: "active",
                            // Ensure onboarding is false so they go through flow when they first login
                            onboardingCompleted: user.onboardingCompleted ?? false
                        });

                        console.log(`[WEBHOOK] User ${user.email} subscribed - Subscription & User synced`);
                    }
                }
                break;
            }

            case "invoice.paid": {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;

                if (subscriptionId) {
                    // Update Subscription
                    await Subscription.findOneAndUpdate(
                        { stripeSubscriptionId: subscriptionId },
                        { status: "active" }
                    );
                    // Sync to User
                    await User.findOneAndUpdate(
                        { stripeSubscriptionId: subscriptionId },
                        { subscriptionStatus: "active" }
                    );
                    console.log(`[WEBHOOK] Invoice paid (${event.type}) - synced: ${subscriptionId}`);
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;

                if (subscriptionId) {
                    // Update Subscription
                    await Subscription.findOneAndUpdate(
                        { stripeSubscriptionId: subscriptionId },
                        { status: "past_due" }
                    );
                    // Sync to User
                    await User.findOneAndUpdate(
                        { stripeSubscriptionId: subscriptionId },
                        { subscriptionStatus: "past_due" }
                    );
                    console.log(`[WEBHOOK] Payment failed - synced: ${subscriptionId}`);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                // Update Subscription
                await Subscription.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    { status: "canceled" }
                );
                // Sync to User (remove tier)
                await User.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    {
                        subscriptionStatus: "canceled",
                        subscriptionTier: undefined,
                    }
                );
                console.log(`[WEBHOOK] Subscription canceled - synced: ${subscription.id}`);
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const status = subscription.status;

                let mappedStatus: "active" | "canceled" | "past_due" | "trialing";
                if (status === "active" || status === "trialing") {
                    mappedStatus = status === "trialing" ? "trialing" : "active";
                } else if (status === "past_due") {
                    mappedStatus = "past_due";
                } else {
                    mappedStatus = "canceled";
                }

                // Build update object with null checks for dates
                const updateData: Record<string, unknown> = {
                    status: mappedStatus,
                    stripePriceId: subscription.items.data[0]?.price.id,
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                };

                if (subscription.current_period_start) {
                    updateData.currentPeriodStart = new Date(subscription.current_period_start * 1000);
                }
                if (subscription.current_period_end) {
                    updateData.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                }

                // Update Subscription
                await Subscription.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    updateData
                );
                // Sync to User
                await User.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    {
                        subscriptionStatus: mappedStatus,
                        stripePriceId: subscription.items.data[0]?.price.id,
                    }
                );
                console.log(`[WEBHOOK] Subscription updated - synced: ${subscription.id} -> ${mappedStatus}`);
                break;
            }

            default:
                console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[WEBHOOK] Error processing webhook:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
