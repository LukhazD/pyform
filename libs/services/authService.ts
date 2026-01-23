import { auth } from "@/libs/next-auth";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, getSession as nextAuthGetSession } from "next-auth/react";

import { Session } from "next-auth";

export interface IAuthService {
    signInWithGoogle(): Promise<void>; // signIn typically redirects or returns void/undefined in client flow
    signOut(): Promise<void>;
    getSession(): Promise<Session | null>;
}

// Client-side implementation mostly, but can be used in server components if adapted
class AuthService implements IAuthService {
    async signInWithGoogle() {
        // This is client-side only usually
        if (typeof window !== 'undefined') {
            return await nextAuthSignIn("google");
        }
    }

    async signOut() {
        if (typeof window !== 'undefined') {
            await nextAuthSignOut();
        }
    }

    async getSession(): Promise<Session | null> {
        // Shared method for client/server
        if (typeof window === 'undefined') {
            // Server side
            return await auth();
        } else {
            // Client side
            return await nextAuthGetSession();
        }
    }
}

export const authService = new AuthService();
