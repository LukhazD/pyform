import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/libs/auth.config";
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const { auth } = NextAuth(authConfig);

const intlMiddleware = createIntlMiddleware(routing);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Strip locale prefix for path matching
    const pathname = nextUrl.pathname;
    const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, '') || '/';

    const isDashboard = pathnameWithoutLocale.startsWith("/dashboard");
    const isOnboarding = pathnameWithoutLocale === "/onboarding";
    const isSubscribe = pathnameWithoutLocale === "/subscribe";
    const isPaymentSuccess = pathnameWithoutLocale === "/payment-success";
    const isApi = pathname.startsWith("/api");
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

    // Run i18n middleware for locale detection and routing
    return intlMiddleware(req);
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
