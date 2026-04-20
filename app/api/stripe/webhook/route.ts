import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import ApiKey from "@/models/ApiKey";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-08-16",
    typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// In-memory idempotency cache — best-effort deduplication only.
// ⚠️  In serverless (Vercel), each instance has its own Map.
// This is acceptable because:
// 1. Stripe retries use the same event.id — the Map catches same-instance replays
// 2. All DB operations below are written to be idempotent (findOneAndUpdate with
//    specific conditions), so processing the same event twice is safe
// 3. For stronger guarantees, replace with a MongoDB collection or Redis set
const processedEvents = new Map<string, number>();
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;

if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [id, ts] of processedEvents.entries()) {
            if (now - ts > IDEMPOTENCY_TTL_MS) processedEvents.delete(id);
        }
    }, 60_000).unref?.();
}

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

    // Idempotency: skip already-processed events
    if (processedEvents.has(event.id)) {
        return NextResponse.json({ received: true, deduplicated: true });
    }

    await connectMongo();

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.mode === "subscription") {
                    const subscriptionId = session.subscription as string;
                    const customerId = session.customer as string;

                    // Get subscription details from Stripe
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = stripeSubscription.items.data[0]?.price.id;

                    // Find user: prefer client_reference_id (set during checkout for logged-in users),
                    // fall back to email. This handles the case where the user's auth email
                    // (e.g., Google OAuth) differs from the email entered in Stripe checkout.
                    let user = session.client_reference_id
                        ? await User.findById(session.client_reference_id)
                        : null;
                    if (!user && session.customer_email) {
                        user = await User.findOne({ email: session.customer_email });
                    }

                    if (!user && session.customer_email) {
                        try {
                            user = await User.create({
                                email: session.customer_email,
                                name: session.customer_details?.name || session.customer_email.split("@")[0],
                                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.customer_details?.name || "User")}&background=random`,
                            });
                            console.log(`[WEBHOOK] Created new user for email: ${session.customer_email}`);
                        } catch (err) {
                            console.error(`[WEBHOOK] Error creating user: ${err}`);
                            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
                        }
                    }

                    if (!user) {
                        console.error(`[WEBHOOK] Cannot resolve user for checkout session: ${session.id}`);
                        return NextResponse.json({ error: "User not found" }, { status: 400 });
                    }

                    // Guard against subscription hijacking: if the user already has a
                    // different stripeCustomerId, refuse to overwrite it. This prevents
                    // an attacker from entering another user's email in Stripe checkout
                    // and taking over their billing identity.
                    if (user.stripeCustomerId && user.stripeCustomerId !== customerId) {
                        console.error(`[WEBHOOK] Refusing to overwrite stripeCustomerId for user ${user.email}: existing=${user.stripeCustomerId}, incoming=${customerId}`);
                        return NextResponse.json({ error: "Customer ID mismatch" }, { status: 400 });
                    }

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
                        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                        onboardingCompleted: user.onboardingCompleted ?? false
                    });

                    console.log(`[WEBHOOK] User ${user.email} subscribed - Subscription & User synced`);
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
                        { status: "active", tier: "pro" }
                    );
                    // Sync to User — always restore tier (may have been $unset
                    // if user previously canceled and then resubscribed)
                    await User.findOneAndUpdate(
                        { stripeSubscriptionId: subscriptionId },
                        { subscriptionStatus: "active", subscriptionTier: "pro" }
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
                // Sync to User (remove tier — must use $unset, undefined is silently ignored by Mongoose)
                const canceledUser = await User.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    {
                        $set: { subscriptionStatus: "canceled" },
                        $unset: { subscriptionTier: 1 },
                    }
                );

                // Auto-revoke all active API keys for this user
                if (canceledUser) {
                    const revokeResult = await ApiKey.updateMany(
                        { userId: canceledUser._id, revokedAt: null },
                        { $set: { revokedAt: new Date() } }
                    );
                    if (revokeResult.modifiedCount > 0) {
                        console.log(`[WEBHOOK] Revoked ${revokeResult.modifiedCount} API key(s) for user ${canceledUser.email}`);
                    }
                }

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

                const isActive = mappedStatus === "active" || mappedStatus === "trialing";

                // Always compute period dates from Stripe (they are always present on active subs)
                const currentPeriodStart = subscription.current_period_start
                    ? new Date(subscription.current_period_start * 1000)
                    : undefined;
                const currentPeriodEnd = subscription.current_period_end
                    ? new Date(subscription.current_period_end * 1000)
                    : undefined;

                // Update Subscription document (source of truth)
                const subUpdate: Record<string, unknown> = {
                    status: mappedStatus,
                    stripePriceId: subscription.items.data[0]?.price.id,
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                };
                if (currentPeriodStart) subUpdate.currentPeriodStart = currentPeriodStart;
                if (currentPeriodEnd) subUpdate.currentPeriodEnd = currentPeriodEnd;
                if (isActive) subUpdate.tier = "pro";

                await Subscription.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    subUpdate
                );

                // Sync to User — always include tier and currentPeriodEnd to
                // prevent stale data from previous events causing access issues
                const userUpdate: Record<string, unknown> = {
                    subscriptionStatus: mappedStatus,
                    stripePriceId: subscription.items.data[0]?.price.id,
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                };
                if (currentPeriodEnd) userUpdate.currentPeriodEnd = currentPeriodEnd;

                if (isActive) {
                    // Restore tier (may have been $unset by a prior cancellation)
                    userUpdate.subscriptionTier = "pro";
                }

                await User.findOneAndUpdate(
                    { stripeSubscriptionId: subscription.id },
                    isActive ? userUpdate : {
                        $set: { subscriptionStatus: mappedStatus, stripePriceId: userUpdate.stripePriceId, cancelAtPeriodEnd: userUpdate.cancelAtPeriodEnd, ...(currentPeriodEnd ? { currentPeriodEnd } : {}) },
                        $unset: { subscriptionTier: 1 },
                    }
                );
                console.log(`[WEBHOOK] Subscription updated - synced: ${subscription.id} -> ${mappedStatus}`);
                break;
            }

            case "charge.dispute.created": {
                const dispute = event.data.object as Stripe.Dispute;
                // Resolve the charge to get the customer ID
                const disputeCharge = typeof dispute.charge === "string"
                    ? await stripe.charges.retrieve(dispute.charge)
                    : dispute.charge;
                const disputeCustomerId = disputeCharge?.customer as string | null;

                if (disputeCustomerId) {
                    // Immediately revoke access — chargebacks are a strong fraud signal
                    const disputedUser = await User.findOneAndUpdate(
                        { stripeCustomerId: disputeCustomerId },
                        {
                            $set: { subscriptionStatus: "canceled" },
                            $unset: { subscriptionTier: 1 },
                        }
                    );

                    if (disputedUser) {
                        await Subscription.findOneAndUpdate(
                            { userId: disputedUser._id },
                            { status: "canceled" }
                        );

                        // Revoke all API keys
                        await ApiKey.updateMany(
                            { userId: disputedUser._id, revokedAt: null },
                            { $set: { revokedAt: new Date() } }
                        );

                        console.log(`[WEBHOOK] Dispute detected — access revoked for user ${disputedUser.email} (customer ${disputeCustomerId})`);
                    }
                }
                break;
            }

            case "charge.refunded": {
                const refundedCharge = event.data.object as Stripe.Charge;
                const refundCustomerId = refundedCharge.customer as string;

                // Only revoke on full refund (amount_refunded >= amount)
                if (refundCustomerId && refundedCharge.amount_captured > 0 && refundedCharge.amount_refunded >= refundedCharge.amount_captured) {
                    const refundedUser = await User.findOneAndUpdate(
                        { stripeCustomerId: refundCustomerId },
                        {
                            $set: { subscriptionStatus: "canceled" },
                            $unset: { subscriptionTier: 1 },
                        }
                    );

                    if (refundedUser) {
                        await Subscription.findOneAndUpdate(
                            { userId: refundedUser._id },
                            { status: "canceled" }
                        );

                        // Revoke all API keys
                        await ApiKey.updateMany(
                            { userId: refundedUser._id, revokedAt: null },
                            { $set: { revokedAt: new Date() } }
                        );

                        console.log(`[WEBHOOK] Full refund — access revoked for user ${refundedUser.email} (customer ${refundCustomerId})`);
                    }
                }
                break;
            }

            default:
                console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
        }

        // Mark event as processed after successful handling
        processedEvents.set(event.id, Date.now());

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[WEBHOOK] Error processing webhook:", error);
        // Return 500 so Stripe retries the event
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
