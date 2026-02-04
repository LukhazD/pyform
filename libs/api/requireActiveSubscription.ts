import { Session } from "next-auth";
import { hasActiveProAccess } from "@/libs/subscriptionUtils";

/**
 * Check if the session user has an active Pro subscription.
 * Use this in API routes to protect CRUD operations.
 * 
 * @param session - NextAuth session object
 * @returns true if user has active access, false otherwise
 */
export function checkActiveSubscription(session: Session | null): boolean {
    if (!session?.user) {
        return false;
    }

    return hasActiveProAccess({
        subscriptionTier: session.user.subscriptionTier,
        subscriptionStatus: session.user.subscriptionStatus,
        cancelAtPeriodEnd: session.user.cancelAtPeriodEnd,
        currentPeriodEnd: session.user.currentPeriodEnd,
    });
}

/**
 * Error response for inactive subscription
 */
export const SUBSCRIPTION_INACTIVE_ERROR = {
    error: "Subscription inactive",
    message: "Tu suscripción no está activa. Por favor, renueva tu plan para continuar.",
} as const;
