import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/libs/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isOnboardingCompleted = req.auth?.user?.onboardingCompleted;

    const isDashboard = nextUrl.pathname.startsWith("/dashboard");
    const isOnboarding = nextUrl.pathname === "/onboarding";
    const isApi = nextUrl.pathname.startsWith("/api");

    // Allow API routes to pass through (auth check handled in route)
    if (isApi) {
        return NextResponse.next();
    }

    // If user is logged in
    if (isLoggedIn) {
        // If onboarding is NOT completed, but user is trying to access dashboard
        // Redirect to onboarding
        if (!isOnboardingCompleted && !isOnboarding) {
            // Only redirect if trying to access protected pages (like dashboard or account)
            // We might want to be more aggressive and redirect ANY page except home/public
            // For now, let's protect dashboard
            if (isDashboard) {
                return Response.redirect(new URL("/onboarding", nextUrl));
            }
        }

        // If onboarding IS completed, but user is on onboarding page
        // Redirect to dashboard
        if (isOnboardingCompleted && isOnboarding) {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
    } else {
        // If not logged in and trying to access dashboard/onboarding
        if (isDashboard || isOnboarding) {
            // Redirect to login (or let NextAuth handle it via pages config if set, but explicit is good)
            // Usually NextAuth handles protection via matcher, but here we do custom logic
            // For now, let's just redirect to home or signin
            // return Response.redirect(new URL("/api/auth/signin", nextUrl));
            // Actually, let's just let them be redirected by the page protection or layout if we had one
            // But since we are in middleware:
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
