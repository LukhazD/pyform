import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from "next-auth/jwt"

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      /** The user's role. */
      role: string;
      /** The user's subscription tier. */
      subscriptionTier: string;
      /** Whether the user has completed onboarding. */
      onboardingCompleted: boolean;
    } & DefaultSession['user'];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    role: string;
    subscriptionTier: string;
    onboardingCompleted: boolean;
  }
}
