export interface PlanFeature {
    name: string;
}

export interface Plan {
    priceId: string;
    name: string;
    description: string;
    price: number;
    priceAnchor?: number;
    features: PlanFeature[];
    isFeatured?: boolean;
}

export interface SubscriptionCheckoutRequest {
    priceId: string;
    mode: "subscription";
    successUrl: string;
    cancelUrl: string;
}

export interface SubscriptionCheckoutResponse {
    url?: string;
    error?: string;
}
