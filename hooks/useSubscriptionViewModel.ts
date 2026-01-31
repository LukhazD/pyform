import { useState } from "react";
import { SubscriptionService } from "@/services/subscriptionService";

export function useSubscriptionViewModel() {
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

    const subscribe = async (priceId: string) => {
        setLoadingPriceId(priceId);

        try {
            const response = await SubscriptionService.createCheckoutSession({
                priceId,
                mode: "subscription",
                successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/subscribe`,
            });

            if (response.url) {
                // Redirecting, keep loading state active
                window.location.href = response.url;
            } else {
                console.error("No checkout URL returned");
                setLoadingPriceId(null);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setLoadingPriceId(null);
        }
    };

    return {
        loadingPriceId,
        subscribe,
    };
}
