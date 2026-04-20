import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import DashboardLayoutClient from "@/components/Dashboard/DashboardLayoutClient";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { hasActiveProAccess } from "@/libs/subscriptionUtils";

// Server-side component — all redirect decisions use the DB (source of truth),
// never the JWT token, to avoid stale-session loops.
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(config.auth.loginUrl);
  }

  await connectMongo();
  const user = await User.findById(session.user.id);

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  if (!hasActiveProAccess(user)) {
    redirect("/subscribe");
  }

  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
