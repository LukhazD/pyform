import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserService } from "@/services/UserService";

export function usePaymentSuccessViewModel() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const { update, status } = useSession();
    const [isRefreshing, setIsRefreshing] = useState(true);
    const [refreshComplete, setRefreshComplete] = useState(false);
    const hasAttemptedRefresh = useRef(false);

    useEffect(() => {
        if (hasAttemptedRefresh.current) return;
        if (status === "loading") return;

        const refreshSession = async () => {
            hasAttemptedRefresh.current = true;

            if (status === "authenticated") {
                try {
                    const freshData = await UserService.refreshSession(sessionId);

                    await update({
                        subscriptionTier: freshData.subscriptionTier,
                        subscriptionStatus: freshData.subscriptionStatus,
                        onboardingCompleted: freshData.onboardingCompleted,
                        role: freshData.role,
                    });

                    setRefreshComplete(true);
                } catch (error) {
                    console.error("Error refreshing session:", error);
                } finally {
                    setIsRefreshing(false);
                }
            } else if (status === "unauthenticated") {
                router.push("/auth/signin");
            }
        };

        refreshSession();
    }, [status, update, sessionId, router]);

    const handleContinue = () => {
        window.location.href = "/dashboard";
    };

    const handleRetry = () => {
        router.push("/auth/signin");
    };

    return {
        isRefreshing,
        refreshComplete,
        handleContinue,
        handleRetry
    };
}
