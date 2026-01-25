import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/libs/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isOnboardingCompleted = req.auth?.user?.onboardingCompleted;
    const subscriptionStatus = req.auth?.user?.subscriptionStatus;
    const hasActiveSubscription = subscriptionStatus === "active";

    const isDashboard = nextUrl.pathname.startsWith("/dashboard");
    const isOnboarding = nextUrl.pathname === "/onboarding";
    const isSubscribe = nextUrl.pathname === "/subscribe";
    const isApi = nextUrl.pathname.startsWith("/api");

    // Allow API routes to pass through (auth check handled in route)
    if (isApi) {
        return NextResponse.next();
    }

    // If user is logged in
    if (isLoggedIn) {
        // Step 1: Check onboarding first
        if (!isOnboardingCompleted) {
            // User hasn't completed onboarding
            if (!isOnboarding) {
                // Redirect to onboarding if trying to access protected pages
                if (isDashboard || isSubscribe) {
                    return Response.redirect(new URL("/onboarding", nextUrl));
                }
            }
            return NextResponse.next();
        }

        // Step 2: Onboarding is done, check subscription
        if (!hasActiveSubscription) {
            // User hasn't subscribed yet
            if (isOnboarding) {
                // User completed onboarding, redirect to subscribe
                return Response.redirect(new URL("/subscribe", nextUrl));
            }
            if (isDashboard) {
                // Block dashboard access, redirect to subscribe
                return Response.redirect(new URL("/subscribe", nextUrl));
            }
            return NextResponse.next();
        }

        // Step 3: User has active subscription - full access
        if (isOnboarding || isSubscribe) {
            // Don't let subscribed users go back to onboarding/subscribe
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
    } else {
        // If not logged in and trying to access protected pages
        if (isDashboard || isOnboarding || isSubscribe) {
            return Response.redirect(new URL("/api/auth/signin", nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
