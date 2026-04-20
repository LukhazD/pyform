import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";
import User from "@/models/User";
import connectMongoose from "@/libs/mongoose";
import { authConfig } from "./auth.config";
import { getMagicLinkEmailHTML, getMagicLinkEmailText } from "./emailTemplate";

/** How often (ms) the JWT callback re-checks the DB for subscription changes. */
const SESSION_REVALIDATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const baseJwtCallback = authConfig.callbacks?.jwt;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    jwt: async (params: any) => {
      // Run the base callback first (handles sign-in, session updates)
      const token = baseJwtCallback ? await baseJwtCallback(params) : params.token;

      // Periodic DB revalidation (server-side only — safe to use Mongoose here).
      // Re-checks subscription status to catch webhook-driven changes
      // (cancellations, disputes, refunds) that the stale JWT wouldn't know about.
      if (!params.user && params.trigger !== "update" && token.id) {
        const now = Date.now();
        const lastChecked = (token.lastDbCheck as number) || 0;

        if (now - lastChecked > SESSION_REVALIDATION_INTERVAL_MS) {
          try {
            await connectMongoose();
            const dbUser = await User.findById(token.id).lean();
            if (dbUser) {
              token.subscriptionTier = (dbUser as any).subscriptionTier;
              token.subscriptionStatus = (dbUser as any).subscriptionStatus;
              token.cancelAtPeriodEnd = (dbUser as any).cancelAtPeriodEnd ?? false;
              token.currentPeriodEnd = (dbUser as any).currentPeriodEnd?.toISOString?.() ?? (dbUser as any).currentPeriodEnd ?? null;
              token.onboardingCompleted = (dbUser as any).onboardingCompleted;
              token.role = (dbUser as any).role;
            }
            token.lastDbCheck = now;
          } catch (err) {
            console.error("[AUTH] DB revalidation failed:", err);
          }
        }
      }

      return token;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    ...(connectMongo
      ? [
        EmailProvider({
          server: {
            host: "",
            port: 0,
            auth: {
              user: "",
              pass: "",
            },
          },
          from: config.resend.fromNoReply,
          async sendVerificationRequest({ identifier: email, url, provider }) {
            const { Resend } = await import("resend");
            const resend = new Resend(process.env.RESEND_API_KEY!);

            // Detect locale from callbackUrl in the verification URL
            const parsedUrl = new URL(url);
            const callbackUrl = parsedUrl.searchParams.get("callbackUrl") || "";
            const locale = callbackUrl.includes("/es/") || callbackUrl.endsWith("/es") ? "es" : "en";
            const subject = locale === "es"
              ? "Tu enlace para acceder a PyForm"
              : "Your PyForm access link";

            const result = await resend.emails.send({
              to: email,
              from: provider.from as string,
              subject,
              text: getMagicLinkEmailText(url, locale),
              html: getMagicLinkEmailHTML(url, locale),
            });

            if (result.error) {
              console.error("Resend error:", result.error);
              throw new Error(`Resend error: ${result.error.message}`);
            }
          },
        }),
      ]
      : []),
  ],
  ...(connectMongo && { adapter: MongoDBAdapter(connectMongo, { databaseName: "pyform" }) }),
  events: {
    async createUser({ user }: { user: any }) {
      try {
        await connectMongoose();
        await User.findByIdAndUpdate(user.id, {
          role: "user",
          // subscriptionTier and subscriptionStatus are set when user subscribes via Stripe webhook
        });
        console.log(`User ${user.id} initialized with default schema values.`);
      } catch (error) {
        console.error("Error setting user defaults:", error);
      }
    },
  },
});
