"use client";

import { Suspense } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { CheckCircle, Loader2 } from "lucide-react";
import { usePaymentSuccessViewModel } from "@/hooks/usePaymentSuccessViewModel";

function PaymentSuccessContent() {
    const { isRefreshing, refreshComplete, handleContinue, handleRetry, isNavigating } = usePaymentSuccessViewModel();

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
                            isLoading={isNavigating}
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
                            onPress={handleRetry}
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
