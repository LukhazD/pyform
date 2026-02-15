import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import Sidebar from "@/components/Dashboard/Sidebar";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { hasActiveProAccess } from "@/libs/subscriptionUtils";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
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

  if (!user || !hasActiveProAccess(user)) {
    redirect("/subscribe");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">

        {children}

      </main>
    </div>
  );
}
