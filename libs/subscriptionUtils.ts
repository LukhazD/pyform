/**
 * Subscription utility functions for checking access and status
 */

export interface SubscriptionUser {
    subscriptionTier?: string;
    subscriptionStatus?: string;
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: Date | string | null;
}

/**
 * Check if a user has active Pro access, including grace period after cancellation
 * 
 * @param user - User object with subscription fields
 * @returns true if user has active Pro access
 */
export function hasActiveProAccess(user: SubscriptionUser): boolean {
    // No subscription at all
    if (!user.subscriptionTier || user.subscriptionTier !== "pro") {
        return false;
    }

    // Fully active subscription (not canceling)
    if (user.subscriptionStatus === "active" && !user.cancelAtPeriodEnd) {
        return true;
    }

    // Trialing subscription
    if (user.subscriptionStatus === "trialing") {
        return true;
    }

    // Canceling but still within paid period (grace period)
    if (user.cancelAtPeriodEnd && user.currentPeriodEnd) {
        const endDate = typeof user.currentPeriodEnd === "string"
            ? new Date(user.currentPeriodEnd)
            : user.currentPeriodEnd;
        return new Date() < endDate;
    }

    // Past due - still has access while Stripe retries payment
    if (user.subscriptionStatus === "past_due") {
        return true;
    }

    return false;
}

/**
 * Get a human-readable subscription status for display
 * 
 * @param user - User object with subscription fields
 * @returns Status object with label, variant, and optional end date
 */
export function getSubscriptionDisplayStatus(user: SubscriptionUser): {
    label: string;
    variant: "active" | "warning" | "error" | "inactive";
    endDate?: Date;
} {
    if (!user.subscriptionTier) {
        return { label: "Sin suscripción", variant: "inactive" };
    }

    if (user.subscriptionStatus === "canceled") {
        return { label: "Cancelada", variant: "error" };
    }

    if (user.subscriptionStatus === "past_due") {
        return { label: "Pago pendiente", variant: "warning" };
    }

    if (user.subscriptionStatus === "trialing") {
        return { label: "Período de prueba", variant: "active" };
    }

    if (user.cancelAtPeriodEnd && user.currentPeriodEnd) {
        const endDate = typeof user.currentPeriodEnd === "string"
            ? new Date(user.currentPeriodEnd)
            : user.currentPeriodEnd;
        return {
            label: "Cancela pronto",
            variant: "warning",
            endDate
        };
    }

    return { label: "Plan Pro Activo", variant: "active" };
}

/**
 * Format a date for display in Spanish
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatSubscriptionDate(date: Date | string | null | undefined): string {
    if (!date) return "";

    const d = typeof date === "string" ? new Date(date) : date;

    return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}
