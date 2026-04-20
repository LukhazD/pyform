import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { findCheckoutSession } from "@/libs/stripe";
import configFile from "@/config";
import Stripe from "stripe";

/**
 * GET /api/user/refresh-session
 * Fetches fresh user data from MongoDB for session refresh.
 * Called from /payment-success to get updated subscription status.
 * If provided with a session_id, checks Stripe directly if DB is stale.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");

        await connectMongo();

        let user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

            // If user is not yet active/pro AND we have a session_id, check Stripe directly.
        // This handles the race condition where the webhook hasn't fired yet.
        if ((!user.subscriptionStatus || user.subscriptionStatus !== 'active') && sessionId) {
            try {
                const stripeSession = await findCheckoutSession(sessionId) as Stripe.Checkout.Session;

                if (stripeSession && stripeSession.payment_status === 'paid') {
                    // SECURITY: Strictly require client_reference_id match — do NOT fall back
                    // to email, as that allows any user with a matching email to replay sessions.
                    const isSessionOwner = stripeSession.client_reference_id === user._id.toString();

                    // Time window: only accept sessions created within the last 30 minutes
                    const sessionAge = Date.now() - (stripeSession.created * 1000);
                    const MAX_SESSION_AGE_MS = 30 * 60 * 1000;
                    const isRecent = sessionAge < MAX_SESSION_AGE_MS;

                    if (isSessionOwner && isRecent) {
                        const priceId = stripeSession.line_items?.data[0]?.price?.id;
                        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

                        if (plan) {
                            const customerId = stripeSession.customer as string;

                            // Guard: do not overwrite an existing stripeCustomerId from a different customer
                            if (user.stripeCustomerId && user.stripeCustomerId !== customerId) {
                                console.error(`[REFRESH] Customer ID mismatch for user ${user._id}: existing=${user.stripeCustomerId}, session=${customerId}`);
                            } else {
                                user.stripePriceId = priceId;
                                user.stripeCustomerId = customerId;
                                user.stripeSubscriptionId = stripeSession.subscription as string;
                                user.subscriptionStatus = "active";
                                user.subscriptionTier = "pro";
                                await user.save();
                            }
                        }
                    }
                }
            } catch (stripeError) {
                console.error("Error verifying stripe session:", stripeError);
            }
        }

        // Return the fields needed to update the session and billing UI
        return NextResponse.json({
            subscriptionTier: user.subscriptionTier || null,
            subscriptionStatus: user.subscriptionStatus || null,
            cancelAtPeriodEnd: user.cancelAtPeriodEnd || false,
            currentPeriodEnd: user.currentPeriodEnd?.toISOString() || null,
            stripePriceId: user.stripePriceId || null,
            onboardingCompleted: user.onboardingCompleted || false,
            role: user.role || "user",
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
