import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";
import User from "@/models/User";
import connectMongoose from "@/libs/mongoose";
import { authConfig } from "./auth.config";

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
            host: "smtp.resend.com",
            port: 465,
            auth: {
              user: "resend",
              pass: process.env.RESEND_API_KEY,
            },
          },
          from: config.resend.fromNoReply,
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
