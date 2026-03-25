import type { NextAuthConfig } from "next-auth";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

/** How often (ms) the JWT callback re-checks the DB for subscription changes. */
const SESSION_REVALIDATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const authConfig = {
    // Set any random key in .env.local
    secret: process.env.AUTH_SECRET,
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

            // Periodic DB revalidation: re-check subscription status to catch
            // webhook-driven changes (cancellations, disputes, refunds) that the
            // stale JWT token wouldn't know about.
            if (!user && trigger !== "update" && token.id) {
                const now = Date.now();
                const lastChecked = (token.lastDbCheck as number) || 0;

                if (now - lastChecked > SESSION_REVALIDATION_INTERVAL_MS) {
                    try {
                        await connectMongo();
                        const dbUser = await User.findById(token.id).lean();
                        if (dbUser) {
                            token.subscriptionTier = dbUser.subscriptionTier;
                            token.subscriptionStatus = dbUser.subscriptionStatus;
                            token.cancelAtPeriodEnd = dbUser.cancelAtPeriodEnd ?? false;
                            token.currentPeriodEnd = dbUser.currentPeriodEnd?.toISOString?.() ?? dbUser.currentPeriodEnd ?? null;
                            token.onboardingCompleted = dbUser.onboardingCompleted;
                            token.role = dbUser.role;
                        }
                        token.lastDbCheck = now;
                    } catch (err) {
                        // Silently fail — keep existing token data rather than breaking auth
                        console.error("[AUTH] DB revalidation failed:", err);
                    }
                }
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
