"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    CreditCard,
    ExternalLink,
    Crown,
    Clock,
    AlertTriangle,
    RefreshCw,
    CalendarDays,
    ShieldAlert,
    Info,
} from "lucide-react";
import { useSession } from "next-auth/react";
import apiClient from "@/libs/api";
import { useTranslations, useLocale } from "next-intl";
import {
    getSubscriptionDisplayStatus,
    formatSubscriptionDate,
} from "@/libs/subscriptionUtils";
import config from "@/config";

interface FreshSessionData {
    subscriptionTier: string | null;
    subscriptionStatus: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    stripePriceId: string | null;
    onboardingCompleted: boolean;
    role: string;
}

interface SessionData {
    subscriptionTier: string | undefined;
    subscriptionStatus: string | undefined;
    cancelAtPeriodEnd: boolean | undefined;
    currentPeriodEnd: string | undefined;
    stripePriceId: string | undefined;
}

export default function SubscriptionCard({ session: initialSession }: { session: any }) {
    const { update } = useSession();
    const t = useTranslations("subscription");
    const locale = useLocale();
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(true);
    const [sessionData, setSessionData] = useState<SessionData>({
        subscriptionTier: initialSession.user?.subscriptionTier,
        subscriptionStatus: initialSession.user?.subscriptionStatus,
        cancelAtPeriodEnd: initialSession.user?.cancelAtPeriodEnd,
        currentPeriodEnd: initialSession.user?.currentPeriodEnd,
        stripePriceId: initialSession.user?.stripePriceId,
    });

    useEffect(() => {
        const syncSession = async () => {
            try {
                const response = await fetch("/api/user/refresh-session");
                if (!response.ok) throw new Error("Failed to refresh");

                const freshData: FreshSessionData = await response.json();

                const needsUpdate =
                    freshData.subscriptionTier !== sessionData.subscriptionTier ||
                    freshData.subscriptionStatus !== sessionData.subscriptionStatus ||
                    freshData.cancelAtPeriodEnd !== sessionData.cancelAtPeriodEnd ||
                    freshData.currentPeriodEnd !== sessionData.currentPeriodEnd;

                if (needsUpdate) {
                    await update({
                        subscriptionTier: freshData.subscriptionTier,
                        subscriptionStatus: freshData.subscriptionStatus,
                        cancelAtPeriodEnd: freshData.cancelAtPeriodEnd,
                        currentPeriodEnd: freshData.currentPeriodEnd,
                    });
                }

                setSessionData({
                    subscriptionTier: freshData.subscriptionTier ?? undefined,
                    subscriptionStatus: freshData.subscriptionStatus ?? undefined,
                    cancelAtPeriodEnd: freshData.cancelAtPeriodEnd,
                    currentPeriodEnd: freshData.currentPeriodEnd ?? undefined,
                    stripePriceId: freshData.stripePriceId ?? undefined,
                });
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
                { returnUrl: window.location.href }
            );
            window.location.href = url;
        } catch (e: any) {
            console.error(e);
            const errorMessage = e?.message?.includes("billing account")
                ? t("manualError")
                : t("portalError");
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state
    const hasSubscription = sessionData.subscriptionTier === "pro";
    const isCanceling = sessionData.subscriptionStatus === "active" && sessionData.cancelAtPeriodEnd;
    const isPastDue = sessionData.subscriptionStatus === "past_due";
    const isCanceled = sessionData.subscriptionStatus === "canceled";
    const isTrialing = sessionData.subscriptionStatus === "trialing";

    const planName = (() => {
        if (!sessionData.stripePriceId) return "Pro";
        const plan = config.stripe.plans.find(p => p.priceId === sessionData.stripePriceId);
        return plan?.name ?? "Pro";
    })();

    const planPrice = (() => {
        if (!sessionData.stripePriceId) return null;
        const plan = config.stripe.plans.find(p => p.priceId === sessionData.stripePriceId);
        if (!plan) return null;
        const isAnnual = plan.name.toLowerCase().includes("anual");
        return `${plan.price}€/${isAnnual ? t("perYear") : t("perMonth")}`;
    })();

    // Status badge
    const getStatusBadge = () => {
        if (isSyncing) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                    <RefreshCw size={14} className="animate-spin" />
                    {t("verifying")}
                </span>
            );
        }

        const styles = {
            active: "bg-green-50 text-green-700",
            warning: "bg-amber-50 text-amber-700",
            error: "bg-red-50 text-red-700",
            inactive: "bg-gray-100 text-gray-600",
        };

        const icons: Record<string, React.ReactNode> = {
            active: <div className="w-2 h-2 bg-green-500 rounded-full" />,
            warning: <Clock size={14} />,
            error: <AlertTriangle size={14} />,
            inactive: null,
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${styles[subscriptionStatus.variant]}`}>
                {icons[subscriptionStatus.variant]}
                {t(subscriptionStatus.labelKey)}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
                        <CreditCard className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-semibold text-gray-900">{t("title")}</h2>
                            {getStatusBadge()}
                        </div>
                    </div>
                </div>
                {hasSubscription ? (
                    <button
                        onClick={handleManageSubscription}
                        disabled={isLoading || isSyncing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl text-sm font-medium transition-colors duration-200"
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <>
                                {t("manage")}
                                <ExternalLink size={14} />
                            </>
                        )}
                    </button>
                ) : (
                    <Link
                        href="/subscribe"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors duration-200"
                    >
                        {t("subscribe")}
                        <Crown size={14} />
                    </Link>
                )}
            </div>

            {/* Billing Details */}
            {!isSyncing && (
                <div className="p-6 pt-5">
                    {hasSubscription ? (
                        <div className="space-y-4">
                            {/* Plan & Price Row */}
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Crown size={15} className="text-amber-500" />
                                    {t("currentPlan")}
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {planName}
                                    {planPrice && (
                                        <span className="text-gray-400 font-normal ml-1.5">
                                            ({planPrice})
                                        </span>
                                    )}
                                </span>
                            </div>

                            {/* Next Billing / Access End Date */}
                            {sessionData.currentPeriodEnd && (
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CalendarDays size={15} />
                                        {isCanceling
                                            ? t("accessUntil")
                                            : isTrialing
                                                ? t("trialEnd")
                                                : t("nextBilling")}
                                    </div>
                                    <span className={`text-sm font-semibold ${isCanceling ? "text-amber-600" : "text-gray-900"}`}>
                                        {formatSubscriptionDate(sessionData.currentPeriodEnd, locale)}
                                    </span>
                                </div>
                            )}

                            {/* Cancellation warning */}
                            {isCanceling && (
                                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                    <ShieldAlert size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-amber-800">
                                            {t("cancelScheduled")}
                                        </p>
                                        <p className="text-amber-700 mt-1">
                                            {t.rich("cancelDescription", {
                                                date: formatSubscriptionDate(sessionData.currentPeriodEnd, locale),
                                                strong: (chunks) => <strong>{chunks}</strong>,
                                            })}
                                        </p>
                                        <button
                                            onClick={handleManageSubscription}
                                            disabled={isLoading}
                                            className="inline-flex items-center gap-1.5 mt-3 text-amber-800 font-medium hover:text-amber-900 transition-colors"
                                        >
                                            {t("reactivate")}
                                            <ExternalLink size={13} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Past due warning */}
                            {isPastDue && (
                                <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-red-800">
                                            {t("paymentFailed")}
                                        </p>
                                        <p className="text-red-700 mt-1">
                                            {t("paymentFailedDescription")}
                                        </p>
                                        <button
                                            onClick={handleManageSubscription}
                                            disabled={isLoading}
                                            className="inline-flex items-center gap-1.5 mt-3 text-red-800 font-medium hover:text-red-900 transition-colors"
                                        >
                                            {t("updatePayment")}
                                            <ExternalLink size={13} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Trial info */}
                            {isTrialing && sessionData.currentPeriodEnd && (
                                <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-800">
                                            {t("trialActive")}
                                        </p>
                                        <p className="text-blue-700 mt-1" dangerouslySetInnerHTML={{ __html: t("trialDescription", { date: formatSubscriptionDate(sessionData.currentPeriodEnd, locale) }) }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            {isCanceled
                                ? t("canceled")
                                : t("noSubscription")}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
