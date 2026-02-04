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

        // If user is not yet active/pro AND we have a session_id, check Stripe directly
        // This handles race condition where webhook hasn't fired yet
        if ((!user.subscriptionStatus || user.subscriptionStatus !== 'active') && sessionId) {
            try {
                console.log(`Checking Stripe session ${sessionId} for user ${user._id}`);
                const stripeSession = await findCheckoutSession(sessionId) as Stripe.Checkout.Session;

                if (stripeSession && stripeSession.payment_status === 'paid') {
                    // Double check this session belongs to the user (client_reference_id or customer email)
                    const isSessionValid =
                        stripeSession.client_reference_id === user._id.toString() ||
                        stripeSession.customer_details?.email === user.email;

                    if (isSessionValid) {
                        console.log(`Payment confirmed for session ${sessionId}. Updating user manually.`);

                        const priceId = stripeSession.line_items?.data[0]?.price?.id;
                        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

                        if (plan) {
                            // Manually update user since webhook might be delayed
                            user.stripePriceId = priceId;
                            user.stripeCustomerId = stripeSession.customer as string;
                            user.stripeSubscriptionId = stripeSession.subscription as string;
                            user.subscriptionStatus = "active";
                            user.subscriptionTier = "pro";

                            await user.save();
                            console.log("User updated manually via refresh logic");
                        }
                    }
                }
            } catch (stripeError) {
                console.error("Error verifying stripe session:", stripeError);
                // Continue to return user data as is if stripe check fails
            }
        }

        // Return the fields needed to update the session
        return NextResponse.json({
            subscriptionTier: user.subscriptionTier || null,
            subscriptionStatus: user.subscriptionStatus || null,
            cancelAtPeriodEnd: user.cancelAtPeriodEnd || false,
            currentPeriodEnd: user.currentPeriodEnd?.toISOString() || null,
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
