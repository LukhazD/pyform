import { SubscriptionCheckoutRequest, SubscriptionCheckoutResponse } from "@/types/Subscription";

export class SubscriptionService {
    static async createCheckoutSession(
        data: SubscriptionCheckoutRequest
    ): Promise<SubscriptionCheckoutResponse> {
        try {
            const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Server API Error:", errorData);
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }

            return await res.json();
        } catch (error) {
            console.error("SubscriptionService error:", error);
            throw error;
        }
    }
}
