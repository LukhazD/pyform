import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { hasActiveProAccess } from "@/libs/subscriptionUtils";
import config from "@/config";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect(config.auth.loginUrl);
    }

    await connectMongo();
    const user = await User.findById(session.user.id);

    if (user?.onboardingCompleted) {
        // Onboarding already done — send to the right place
        if (hasActiveProAccess(user)) {
            redirect("/dashboard");
        }
        redirect("/subscribe");
    }

    return (
        <div className="min-h-screen bg-base-100">
            {children}
        </div>
    );
}
