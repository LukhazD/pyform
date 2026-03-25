import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { hasActiveProAccess } from "@/libs/subscriptionUtils";

export default async function SubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Server-side DB check: redirect truly active users to dashboard.
    // This replaces the old middleware redirect (which used a stale JWT and
    // caused a loop when the dashboard layout detected a canceled subscription).
    const session = await auth();

    if (session?.user?.id) {
        await connectMongo();
        const user = await User.findById(session.user.id);

        if (user && hasActiveProAccess(user)) {
            redirect("/dashboard");
        }
    }

    return <div className="min-h-screen bg-base-100">{children}</div>;
}
