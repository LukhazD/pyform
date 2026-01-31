import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import FormAnalytics, { IFormAnalytics } from "@/models/FormAnalytics";
import { aggregateAnalytics } from "@/utils/analytics-helper";
import { GlobalAnalyticsResponse } from "@/types/Analytics";

export class AnalyticsService {
    static async getGlobalAnalytics(userId: string): Promise<GlobalAnalyticsResponse> {
        await connectMongo();

        // Get all form IDs for this user
        const forms = await Form.find({ userId }).select("_id title shortId").lean();
        const formIds = forms.map(f => f._id);

        // Get analytics for these forms
        const allAnalytics = await FormAnalytics.find({ formId: { $in: formIds } }).lean();

        // Aggregate data
        const aggregated = aggregateAnalytics(allAnalytics as any[]);

        // Join form info with analytics for the list
        const formsWithStats = forms.map(f => {
            const stats = allAnalytics.find(a => a.formId.toString() === f._id.toString());
            const views = stats?.views || 0;
            const completions = stats?.completedSubmissions || 0;
            const rate = views > 0 ? Math.round((completions / views) * 100) : 0;

            return {
                formId: f._id.toString(),
                title: f.title,
                shortId: f.shortId,
                views: views,
                submissions: stats?.totalSubmissions || 0,
                completedSubmissions: completions,
                completionRate: rate
            };
        }).sort((a, b) => b.completedSubmissions - a.completedSubmissions);

        return { aggregated, formsWithStats };
    }
}
