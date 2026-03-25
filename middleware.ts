import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/libs/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isDashboard = nextUrl.pathname.startsWith("/dashboard");
    const isOnboarding = nextUrl.pathname === "/onboarding";
    const isSubscribe = nextUrl.pathname === "/subscribe";
    const isPaymentSuccess = nextUrl.pathname === "/payment-success";
    const isApi = nextUrl.pathname.startsWith("/api");
    const isProtected = isDashboard || isOnboarding || isSubscribe || isPaymentSuccess;

    // Allow API routes to pass through (auth check handled per-route)
    if (isApi) {
        return NextResponse.next();
    }

    if (!isLoggedIn && isProtected) {
        // Unauthenticated users can't access protected pages
        return Response.redirect(new URL("/api/auth/signin", nextUrl));
    }

    // All subscription / onboarding redirect logic is handled by server-side
    // layouts (dashboard/layout.tsx, subscribe/layout.tsx) which check the DB
    // directly. The middleware JWT can be stale (Edge Runtime cannot query
    // MongoDB), so making redirect decisions here causes loops when the JWT
    // disagrees with the actual DB state.

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
