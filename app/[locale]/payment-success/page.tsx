"use client";

import { Suspense } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { CheckCircle, Loader2 } from "lucide-react";
import { usePaymentSuccessViewModel } from "@/hooks/usePaymentSuccessViewModel";
import { useTranslations } from "next-intl";

function PaymentSuccessContent() {
    const { isRefreshing, refreshComplete, handleContinue, handleRetry, isNavigating } = usePaymentSuccessViewModel();
    const t = useTranslations("paymentSuccess");

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
                                {t("processing")}
                            </h1>
                            <p className="text-gray-500">
                                {t("activating")}
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
                                {t("successTitle")}
                            </h1>
                            <p className="text-gray-500 mb-6">
                                {t("successMessage")}
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full font-medium bg-gray-900 text-white hover:bg-gray-800"
                            onPress={handleContinue}
                            isLoading={isNavigating}
                        >
                            {t("goToDashboard")}
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {t("errorTitle")}
                            </h1>
                            <p className="text-gray-500 mb-6">
                                {t("errorMessage")}
                            </p>
                        </div>
                        <Button
                            size="lg"
                            variant="bordered"
                            className="w-full font-medium"
                            onPress={handleRetry}
                        >
                            {t("retryLogin")}
                        </Button>
                    </>
                )}
            </CardBody>
        </Card>
    );
}

function PaymentSuccessFallback() {
    const t = useTranslations("common");
    return (
        <Card className="w-full max-w-md p-8 shadow-xl bg-white text-center">
            <CardBody className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t("loading")}
                    </h1>
                </div>
            </CardBody>
        </Card>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Suspense fallback={<PaymentSuccessFallback />}>
                <PaymentSuccessContent />
            </Suspense>
        </div>
    );
}
