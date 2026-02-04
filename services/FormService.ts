import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import FormAnalytics from "@/models/FormAnalytics";
import Question, { IQuestion } from "@/models/Question";
import Submission from "@/models/Submission";

export class FormService {
    static async getForm(formId: string, userId: string) {
        await connectMongo();
        let form;
        if (formId.match(/^[0-9a-fA-F]{24}$/)) {
            form = await Form.findOne({ _id: formId, userId }).lean();
        } else {
            form = await Form.findOne({ shortId: formId, userId }).lean();
        }
        return form ? JSON.parse(JSON.stringify(form)) : null;
    }

    static async getFormByShortIdOrId(formId: string) {
        await connectMongo();
        let form;
        if (formId.match(/^[0-9a-fA-F]{24}$/)) {
            form = await Form.findById(formId).lean();
        } else {
            form = await Form.findOne({ shortId: formId }).lean();
        }
        return form ? JSON.parse(JSON.stringify(form)) : null;
    }

    static async getFormAnalytics(formId: string) {
        await connectMongo();
        const analytics = await FormAnalytics.findOne({ formId }).lean();
        return analytics ? JSON.parse(JSON.stringify(analytics)) : null;
    }

    static async getFormQuestions(formId: string) {
        await connectMongo();
        return await Question.find({ formId }).sort({ order: 1 }).lean();
    }

    static async getFormSubmissions(formId: string, limit = 100) {
        await connectMongo();
        return await Submission.find({ formId }).sort({ submittedAt: -1 }).limit(limit).lean();
    }

    static async getFormWithQuestions(formId: string) {
        const form = await this.getFormByShortIdOrId(formId);

        if (!form) {
            return null;
        }

        const questions = await this.getFormQuestions(form._id);

        return {
            form,
            questions: JSON.parse(JSON.stringify(questions)),
        };
    }

    static async getDashboardStats(userId: string) {
        await connectMongo();

        // Parallelize form counts and forms fetching
        const [forms, totalForms, publishedForms] = await Promise.all([
            Form.find({ userId }).select('_id').lean(),
            Form.countDocuments({ userId }),
            Form.countDocuments({ userId, status: "published" })
        ]);

        const formIds = forms.map((f: any) => f._id);

        // Aggregate totals from FormAnalytics
        const result = await FormAnalytics.aggregate([
            { $match: { formId: { $in: formIds } } },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: "$totalSubmissions" },
                    completedSubmissions: { $sum: "$completedSubmissions" },
                    totalViews: { $sum: "$views" }
                }
            }
        ]);

        const stats = result[0] || {
            totalSubmissions: 0,
            completedSubmissions: 0,
            totalViews: 0
        };

        const totalResponses = stats.completedSubmissions;

        // Calculate global completion rate based on aggregated valid data
        // Rate = (Total Completed / Total Views) * 100
        const completionRate = stats.totalViews > 0
            ? Math.round((stats.completedSubmissions / stats.totalViews) * 100)
            : 0;

        return {
            totalForms,
            publishedForms,
            totalResponses,
            completionRate,
        };
    }

    static async getUserForms(userId: string, limit?: number) {
        await connectMongo();
        let query = Form.find({ userId }).sort({ updatedAt: -1 });

        if (limit) {
            query = query.limit(limit);
        }

        const forms = await query.lean();
        const formIds = forms.map((f: any) => f._id);

        // Fetch analytics for all forms in one go
        const analyticsList = await FormAnalytics.find({ formId: { $in: formIds } })
            .select('formId completedSubmissions')
            .lean();

        // Create a map for quick lookup
        const analyticsMap = new Map();
        analyticsList.forEach((a: any) => {
            analyticsMap.set(a.formId.toString(), a.completedSubmissions);
        });

        // Parallelize question counts
        const formsWithCounts = await Promise.all(
            forms.map(async (form: any) => {
                const questionCount = await Question.countDocuments({ formId: form._id });
                const responseCount = analyticsMap.get(form._id.toString()) || 0;

                return {
                    ...form,
                    questionCount,
                    responseCount
                };
            })
        );

        return JSON.parse(JSON.stringify(formsWithCounts));
    }
}
