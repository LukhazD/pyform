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
            if (user) {
                // Handle different possible ID fields from different providers/adapters
                token.id = user.id || user._id?.toString() || token.sub;
                token.role = user.role;
                token.subscriptionTier = user.subscriptionTier;
                token.onboardingCompleted = user.onboardingCompleted;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        session: async ({ session, token }: any) => {
            if (session?.user) {
                if (token) {
                    session.user.id = token.id;
                    session.user.role = token.role;
                    session.user.subscriptionTier = token.subscriptionTier;
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
} satisfies NextAuthConfig;
