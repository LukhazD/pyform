"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink, Crown, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import apiClient from "@/libs/api";
import { getSubscriptionDisplayStatus, formatSubscriptionDate } from "@/libs/subscriptionUtils";

interface FreshSessionData {
    subscriptionTier: string | null;
    subscriptionStatus: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    onboardingCompleted: boolean;
    role: string;
}

export default function SubscriptionCard({ session: initialSession }: { session: any }) {
    const { update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(true);
    const [sessionData, setSessionData] = useState({
        subscriptionTier: initialSession.user?.subscriptionTier,
        subscriptionStatus: initialSession.user?.subscriptionStatus,
        cancelAtPeriodEnd: initialSession.user?.cancelAtPeriodEnd,
        currentPeriodEnd: initialSession.user?.currentPeriodEnd,
        stripeCustomerId: initialSession.user?.stripeCustomerId,
    });

    // Auto-sync session with database on mount
    useEffect(() => {
        const syncSession = async () => {
            try {
                const response = await fetch("/api/user/refresh-session");
                if (!response.ok) throw new Error("Failed to refresh");

                const freshData: FreshSessionData = await response.json();

                // Check if session needs update
                const needsUpdate =
                    freshData.subscriptionTier !== sessionData.subscriptionTier ||
                    freshData.subscriptionStatus !== sessionData.subscriptionStatus ||
                    freshData.cancelAtPeriodEnd !== sessionData.cancelAtPeriodEnd;

                if (needsUpdate) {
                    // Update NextAuth session/token
                    await update({
                        subscriptionTier: freshData.subscriptionTier,
                        subscriptionStatus: freshData.subscriptionStatus,
                        cancelAtPeriodEnd: freshData.cancelAtPeriodEnd,
                        currentPeriodEnd: freshData.currentPeriodEnd,
                    });

                    // Update local state
                    setSessionData({
                        subscriptionTier: freshData.subscriptionTier,
                        subscriptionStatus: freshData.subscriptionStatus,
                        cancelAtPeriodEnd: freshData.cancelAtPeriodEnd,
                        currentPeriodEnd: freshData.currentPeriodEnd,
                        stripeCustomerId: sessionData.stripeCustomerId,
                    });

                    console.log("[SubscriptionCard] Session synced with database");
                }
            } catch (error) {
                console.error("[SubscriptionCard] Error syncing session:", error);
            } finally {
                setIsSyncing(false);
            }
        };

        syncSession();
    }, []);

    const subscriptionStatus = getSubscriptionDisplayStatus({
        subscriptionTier: sessionData.subscriptionTier,
        subscriptionStatus: sessionData.subscriptionStatus,
        cancelAtPeriodEnd: sessionData.cancelAtPeriodEnd,
        currentPeriodEnd: sessionData.currentPeriodEnd,
    });

    const handleManageSubscription = async () => {
        setIsLoading(true);
        try {
            const { url }: { url: string } = await apiClient.post(
                "/stripe/create-portal",
                {
                    returnUrl: window.location.href,
                }
            );
            window.location.href = url;
        } catch (e: any) {
            console.error(e);
            // More specific error message
            const errorMessage = e?.message?.includes("billing account")
                ? "Tu suscripción fue activada manualmente. Contacta soporte para gestionar tu facturación."
                : "Error al abrir el portal de facturación. Intenta de nuevo.";
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (isSyncing) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                    <RefreshCw size={14} className="animate-spin" />
                    Verificando...
                </span>
            );
        }

        switch (subscriptionStatus.variant) {
            case "active":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {subscriptionStatus.label}
                    </span>
                );
            case "warning":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                        <Clock size={14} />
                        {subscriptionStatus.label}
                        {subscriptionStatus.endDate && (
                            <span className="text-amber-600">
                                · {formatSubscriptionDate(subscriptionStatus.endDate)}
                            </span>
                        )}
                    </span>
                );
            case "error":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                        <AlertTriangle size={14} />
                        {subscriptionStatus.label}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        {subscriptionStatus.label}
                    </span>
                );
        }
    };

    const hasSubscription = sessionData.subscriptionTier === "pro";

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-gradient-to-br h-fit from-blue-50 to-indigo-100 rounded-xl">
                        <CreditCard className="text-blue-600" size={24} />
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-semibold text-gray-900">Suscripción</h2>
                            {getStatusBadge()}
                        </div>
                        <p className="text-gray-500 text-sm">
                            {isSyncing
                                ? "Verificando estado de tu suscripción..."
                                : subscriptionStatus.variant === "warning" && subscriptionStatus.endDate
                                    ? `Tu acceso Pro continúa hasta el ${formatSubscriptionDate(subscriptionStatus.endDate)}.`
                                    : hasSubscription
                                        ? "Gestiona tu plan, facturación y métodos de pago."
                                        : "No tienes una suscripción activa."}
                        </p>
                    </div>
                </div>
                {hasSubscription ? (
                    <button
                        onClick={handleManageSubscription}
                        disabled={isLoading || isSyncing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl text-sm font-medium transition-colors duration-200"
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <>
                                Gestionar
                                <ExternalLink size={14} />
                            </>
                        )}
                    </button>
                ) : (
                    <Link
                        href="/subscribe"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors duration-200"
                    >
                        Suscribirse
                        <Crown size={14} />
                    </Link>
                )}
            </div>
        </div>
    );
}

