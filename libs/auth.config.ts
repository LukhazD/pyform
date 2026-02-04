import type { NextAuthConfig } from "next-auth";
import config from "@/config";

export const authConfig = {
    // Set any random key in .env.local
    secret: process.env.NEXTAUTH_SECRET,
    // Trust the host in production (required for custom domains)
    trustHost: true,
    // Providers are defined here to be available for middleware if needed, although mostly for signin page detection
    // For middleware session verification of JWT, we mainly need the secret and jwt strategy
    providers: [] as NextAuthConfig["providers"],

    session: {
        strategy: "jwt",
    },
    callbacks: {
        jwt: async ({ token, user, trigger, session }: any) => {
            // Initial sign-in: populate token from user object
            if (user) {
                token.id = user.id || user._id?.toString() || token.sub;
                token.name = user.name;
                token.role = user.role;
                token.subscriptionTier = user.subscriptionTier;
                token.subscriptionStatus = user.subscriptionStatus;
                token.cancelAtPeriodEnd = user.cancelAtPeriodEnd ?? false;
                token.currentPeriodEnd = user.currentPeriodEnd?.toISOString?.() ?? user.currentPeriodEnd ?? null;
                token.onboardingCompleted = user.onboardingCompleted;
            }

            // Session update triggered with fresh data from API
            if (trigger === "update" && session) {
                // Merge the fresh data passed from client
                if (session.name) {
                    token.name = session.name;
                }
                if (session.subscriptionTier !== undefined) {
                    token.subscriptionTier = session.subscriptionTier;
                }
                if (session.subscriptionStatus !== undefined) {
                    token.subscriptionStatus = session.subscriptionStatus;
                }
                if (session.cancelAtPeriodEnd !== undefined) {
                    token.cancelAtPeriodEnd = session.cancelAtPeriodEnd;
                }
                if (session.currentPeriodEnd !== undefined) {
                    token.currentPeriodEnd = session.currentPeriodEnd;
                }
                if (session.onboardingCompleted !== undefined) {
                    token.onboardingCompleted = session.onboardingCompleted;
                }
                if (session.role !== undefined) {
                    token.role = session.role;
                }
            }

            return token;
        },
        session: async ({ session, token }: any) => {
            if (session?.user) {
                if (token) {
                    session.user.id = token.id;
                    session.user.name = token.name;
                    session.user.role = token.role;
                    session.user.subscriptionTier = token.subscriptionTier;
                    session.user.subscriptionStatus = token.subscriptionStatus;
                    session.user.cancelAtPeriodEnd = token.cancelAtPeriodEnd;
                    session.user.currentPeriodEnd = token.currentPeriodEnd;
                    session.user.onboardingCompleted = token.onboardingCompleted;
                }
            }
            return session;
        },
    },
    theme: {
        brandColor: config.colors.main,
        logo: `https://${config.domainName}/logoAndName.png`,
    },
    pages: {
        signIn: "/auth/signin",
    },
} satisfies NextAuthConfig;
