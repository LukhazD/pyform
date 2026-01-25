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
                    const user = await User.findOne({ email: session.customer_email });

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
                        });

                        console.log(`[WEBHOOK] User ${user.email} subscribed - Subscription & User synced`);
                    } else {
                        console.error(`[WEBHOOK] User not found for email: ${session.customer_email}`);
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
                    console.log(`[WEBHOOK] Invoice paid - synced: ${subscriptionId}`);
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

                // Update Subscription
                await Subscription.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    {
                        status: mappedStatus,
                        stripePriceId: subscription.items.data[0]?.price.id,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    }
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
