"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { Check, Loader2 } from "lucide-react";
import config from "@/config";

export default function SubscribePage() {
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

    const handleSubscribe = async (priceId: string) => {
        // Immediately set loading state
        setLoadingPriceId(priceId);

        try {
            const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId,
                    mode: "subscription",
                    successUrl: `${window.location.origin}/payment-success`,
                    cancelUrl: `${window.location.origin}/subscribe`,
                }),
            });

            const data = await res.json();

            if (data.url) {
                // Keep loading while redirecting
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned");
                setLoadingPriceId(null);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setLoadingPriceId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Elige tu plan
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Accede a todas las funcionalidades de PyForm para crear formularios
                        profesionales que convierten.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {config.stripe.plans.map((plan) => {
                        const isLoading = loadingPriceId === plan.priceId;
                        const isDisabled = loadingPriceId !== null;

                        return (
                            <Card
                                key={plan.priceId}
                                className={`p-6 ${plan.isFeatured
                                    ? "border-2 border-primary shadow-lg scale-105"
                                    : "border border-gray-200"
                                    }`}
                            >
                                <CardHeader className="flex flex-col items-start gap-2 pb-4">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold">{plan.name}</h2>
                                        {plan.isFeatured && (
                                            <Chip color="primary" size="sm" variant="flat">
                                                Mejor valor
                                            </Chip>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm">{plan.description}</p>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        {plan.priceAnchor && (
                                            <span className="text-gray-400 line-through text-lg">
                                                ${plan.priceAnchor}
                                            </span>
                                        )}
                                        <span className="text-4xl font-bold">${plan.price}</span>
                                        <span className="text-gray-500">
                                            /{plan.name.includes("Anual") ? "año" : "mes"}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0">
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span className="text-gray-700">{feature.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        color={plan.isFeatured ? "primary" : "default"}
                                        variant={plan.isFeatured ? "solid" : "bordered"}
                                        size="lg"
                                        className="w-full font-medium"
                                        onPress={() => handleSubscribe(plan.priceId)}
                                        isLoading={isLoading}
                                        isDisabled={isDisabled}
                                        startContent={isLoading ? undefined : null}
                                    >
                                        {isLoading
                                            ? "Redirigiendo a Stripe..."
                                            : plan.isFeatured
                                                ? "Comenzar ahora"
                                                : "Suscribirse"
                                        }
                                    </Button>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>

                <p className="text-center text-gray-500 text-sm mt-8">
                    Cancela cuando quieras. Sin compromisos.
                </p>
            </div>
        </div>
    );
}
