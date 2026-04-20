import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import AnalyticsCards from "@/components/Analytics/AnalyticsCards";
import TimelineChart from "@/components/Analytics/TimelineChart";
import GlobalFormsList from "@/components/Analytics/GlobalFormsList";
import { BarChart3 } from "lucide-react";
import { AnalyticsService } from "@/services/AnalyticsService";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const { aggregated, formsWithStats } = await AnalyticsService.getGlobalAnalytics(session.user.id);
    const t = await getTranslations("analytics");

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gray-900 rounded-xl text-white">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t("globalTitle")}</h1>
                    <p className="text-gray-500">{t("globalSubtitle")}</p>
                </div>
            </div>

            <AnalyticsCards data={aggregated} />

            <div className="flex flex-col gap-8">
                <div className="w-full">
                    <TimelineChart data={aggregated} />
                </div>
                <GlobalFormsList forms={formsWithStats} />
            </div>   
        </div>
    );
}


