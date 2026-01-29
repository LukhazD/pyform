"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardBody } from "@heroui/react";
import { CheckCircle, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const { update, status } = useSession();
    const [isRefreshing, setIsRefreshing] = useState(true);
    const [refreshComplete, setRefreshComplete] = useState(false);
    const hasAttemptedRefresh = useRef(false);

    useEffect(() => {
        // Only attempt refresh once
        if (hasAttemptedRefresh.current) return;
        if (status === "loading") return;

        const refreshSession = async () => {
            hasAttemptedRefresh.current = true;

            if (status === "authenticated") {
                try {
                    // Fetch fresh user data from API
                    const res = await fetch(`/api/user/refresh-session?session_id=${sessionId || ''}`);

                    if (res.ok) {
                        const freshData = await res.json();

                        // Update the session with fresh data
                        await update({
                            subscriptionTier: freshData.subscriptionTier,
                            subscriptionStatus: freshData.subscriptionStatus,
                            onboardingCompleted: freshData.onboardingCompleted,
                            role: freshData.role,
                        });

                        setRefreshComplete(true);
                    } else {
                        console.error("Failed to fetch fresh user data");
                    }
                } catch (error) {
                    console.error("Error refreshing session:", error);
                } finally {
                    setIsRefreshing(false);
                }
            } else if (status === "unauthenticated") {
                // If somehow user lands here without being logged in
                router.push("/auth/signin");
            }
        };

        refreshSession();
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleContinue = () => {
        window.location.href = "/dashboard";
    };

    return (
        <Card className="w-full max-w-md p-8 shadow-xl bg-white text-center">
            <CardBody className="flex flex-col items-center gap-6">
                {isRefreshing ? (
                    <>
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Procesando tu pago...
                            </h1>
                            <p className="text-gray-500">
                                Estamos activando tu suscripción. Un momento por favor.
                            </p>
                        </div>
                    </>
                ) : refreshComplete ? (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                ¡Pago exitoso! 🎉
                            </h1>
                            <p className="text-gray-500 mb-6">
                                Tu suscripción Pro está activa. Ya puedes crear formularios sin límites.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full font-medium bg-gray-900 text-white hover:bg-gray-800"
                            onPress={handleContinue}
                        >
                            Ir al Dashboard
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Algo salió mal
                            </h1>
                            <p className="text-gray-500 mb-6">
                                No pudimos verificar tu suscripción. Por favor, intenta iniciar sesión de nuevo.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            variant="bordered"
                            className="w-full font-medium"
                            onPress={() => router.push("/auth/signin")}
                        >
                            Iniciar sesión
                        </Button>
                    </>
                )}
            </CardBody>
        </Card>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Suspense fallback={
                <Card className="w-full max-w-md p-8 shadow-xl bg-white text-center">
                    <CardBody className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Cargando...
                            </h1>
                        </div>
                    </CardBody>
                </Card>
            }>
                <PaymentSuccessContent />
            </Suspense>
        </div>
    );
}
