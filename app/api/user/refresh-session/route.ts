import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

/**
 * GET /api/user/refresh-session
 * Fetches fresh user data from MongoDB for session refresh.
 * Called from /payment-success to get updated subscription status.
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        await connectMongo();

        const user = await User.findById(session.user.id).lean();

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Return the fields needed to update the session
        return NextResponse.json({
            subscriptionTier: user.subscriptionTier || null,
            subscriptionStatus: user.subscriptionStatus || null,
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
