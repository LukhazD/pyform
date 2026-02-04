import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import Sidebar from "@/components/Dashboard/Sidebar";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">

        {children}

      </main>
    </div>
  );
}
