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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
            
            const result = await resend.emails.send({
              to: email,
              from: provider.from as string,
              subject: "Tu enlace para acceder a PyForm",
              text: getMagicLinkEmailText(url),
              html: getMagicLinkEmailHTML(url),
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
