/**
 * Subscription utility functions for checking access and status.
 *
 * Access decision aligns with Stripe's own status semantics:
 *   - "active"   → paid & usable right now (even if cancel_at_period_end is true)
 *   - "trialing" → in trial, usable
 *   - "past_due" → Stripe is retrying payment — grace window applies
 *   - "canceled" → no access
 */

export interface SubscriptionUser {
    subscriptionTier?: string;
    subscriptionStatus?: string;
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: Date | string | null;
}

/**
 * Check if a user has active Pro access.
 *
 * Stripe keeps `status: "active"` for the entire paid period, even when the
 * customer has scheduled cancellation (`cancel_at_period_end: true`).  When
 * the period actually ends Stripe fires `customer.subscription.deleted` and
 * sets the status to `"canceled"`.  So we should trust the status field —
 * "active" always means the user has paid access right now.
 */
export function hasActiveProAccess(user: SubscriptionUser): boolean {
    // No subscription tier at all
    if (!user.subscriptionTier || user.subscriptionTier !== "pro") {
        return false;
    }

    const status = user.subscriptionStatus;

    // Active subscription — user has paid for the current period.
    // This includes users who scheduled cancellation (cancelAtPeriodEnd=true)
    // because Stripe keeps the status "active" until the period actually ends.
    if (status === "active") {
        return true;
    }

    // Trialing subscription
    if (status === "trialing") {
        return true;
    }

    // Past due — Stripe is retrying payment. Grant a grace window of 7 days
    // after the billing period end to avoid locking out users with transient
    // payment issues, while still preventing indefinite free access.
    if (status === "past_due") {
        if (user.currentPeriodEnd) {
            const endDate = typeof user.currentPeriodEnd === "string"
                ? new Date(user.currentPeriodEnd)
                : user.currentPeriodEnd;
            const PAST_DUE_GRACE_DAYS = 7;
            const graceDeadline = new Date(endDate.getTime() + PAST_DUE_GRACE_DAYS * 24 * 60 * 60 * 1000);
            return new Date() < graceDeadline;
        }
        // No period end date — allow access (shouldn't happen in practice)
        return true;
    }

    // Everything else (canceled, unpaid, incomplete, paused, etc.) → no access
    return false;
}

/**
 * Get a human-readable subscription status for display
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

    if (user.subscriptionStatus === "active" && user.cancelAtPeriodEnd && user.currentPeriodEnd) {
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
