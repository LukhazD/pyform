import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import FormAnalytics, { IFormAnalytics } from "@/models/FormAnalytics";
import AnalyticsCards from "@/components/Analytics/AnalyticsCards";
import TimelineChart from "@/components/Analytics/TimelineChart";
import GlobalFormsList from "@/components/Analytics/GlobalFormsList";
import { aggregateAnalytics } from "@/utils/analytics-helper";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getGlobalAnalytics(userId: string) {
    await connectMongo();

    // Get all form IDs for this user
    const forms = await Form.find({ userId }).select("_id title shortId").lean();
    const formIds = forms.map(f => f._id);

    // Get analytics for these forms
    const allAnalytics = await FormAnalytics.find({ formId: { $in: formIds } }).lean();

    // Aggregate data
    // We need to cast to any/IFormAnalytics because lean() returns POJOs
    const aggregated = aggregateAnalytics(allAnalytics as any[]);

    // Join form info with analytics for the list
    const formsWithStats = forms.map(f => {
        const stats = allAnalytics.find(a => a.formId.toString() === f._id.toString());
        return {
            formId: f._id.toString(),
            title: f.title,
            shortId: f.shortId,
            totalSubmissions: stats?.totalSubmissions || 0,
            completionRate: stats?.completionRate || 0
        };
    }).sort((a, b) => b.totalSubmissions - a.totalSubmissions);

    return { aggregated, formsWithStats };
}

export default async function AnalyticsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const { aggregated, formsWithStats } = await getGlobalAnalytics(session.user.id);

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gray-900 rounded-xl text-white">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analíticas Globales</h1>
                    <p className="text-gray-500">Resumen de rendimiento de todos tus formularios active</p>
                </div>
            </div>

            <AnalyticsCards data={aggregated} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <TimelineChart data={aggregated} />
                </div>
                <div>
                    <GlobalFormsList forms={formsWithStats} />
                </div>
            </div>
        </div>
    );
}
