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
        const totalForms = await Form.countDocuments({ userId });
        const publishedForms = await Form.countDocuments({ userId, status: "published" });

        // TODO: Get actual submission count from Submission model or Analytics
        const totalResponses = 0;
        const completionRate = 0;

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

        const formsWithCounts = await Promise.all(
            forms.map(async (form: any) => {
                const [questionCount, responseCount] = await Promise.all([
                    // Optimistic counting or separate call. 
                    // Note: If performance becomes an issue, we should aggregate or store counts on Form model.
                    Question.countDocuments({ formId: form._id }),
                    Submission.countDocuments({ formId: form._id })
                ]);

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
