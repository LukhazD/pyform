import { NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Valid name is required" },
                { status: 400 }
            );
        }

        await connectMongo();

        console.log("[ONBOARDING DEBUG] session.user.id:", session.user.id);
        console.log("[ONBOARDING DEBUG] name to save:", name.trim());

        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                name: name.trim(),
                onboardingCompleted: true,
            },
            { new: true }
        );

        console.log("[ONBOARDING DEBUG] Updated user result:", user);

        if (!user) {
            // Try to find if user exists with different query
            const existingUser = await User.findOne({ email: session.user.email });
            console.log("[ONBOARDING DEBUG] User by email lookup:", existingUser);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
