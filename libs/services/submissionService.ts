import Submission, { ISubmission, Answer, SubmissionMetadata, SubmissionFilters } from "@/models/Submission";
import FormAnalytics, { IFormAnalytics, IStartDropOffData, ITimelineData } from "@/models/FormAnalytics";
import connectMongo from "@/libs/mongoose";
import mongoose from "mongoose";

export interface ISubmissionService {
    submitResponse(formId: string, answers: Answer[], metadata: SubmissionMetadata, completionTimeMs?: number): Promise<ISubmission>;
    getSubmissions(formId: string, filters?: SubmissionFilters): Promise<ISubmission[]>;
    getSubmissionById(submissionId: string): Promise<ISubmission | null>;
    getAnalytics(formId: string): Promise<IFormAnalytics>;
}

class SubmissionService implements ISubmissionService {
    async submitResponse(formId: string, answers: Answer[], metadata: SubmissionMetadata, completionTimeMs: number = 0): Promise<ISubmission> {
        await connectMongo();

        const formattedAnswers = answers.map((a) => ({
            ...a,
            questionId: new mongoose.Types.ObjectId(a.questionId),
        }));

        const submission = await Submission.create({
            formId: new mongoose.Types.ObjectId(formId),
            answers: formattedAnswers,
            metadata,
            status: "completed",
            completionTimeMs,
            submittedAt: new Date(),
        });

        // Update Analytics (Fire and forget, or await?)
        // Better to await to ensure consistency, or use background job. Await for now.
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Upsert Analytics Document
            // We use simple increment operations where possible
            // For averageCompletionTimeMs, we need a weighted average math: 
            // NewAvg = ((OldAvg * OldCount) + NewTime) / (OldCount + 1)
            // This is hard to do atomically without aggregation pipeline or read-update.
            // Let's do a transactional approach (or just simple read-modify-write since traffic is low)

            let analytics = await FormAnalytics.findOne({ formId });

            if (!analytics) {
                analytics = new FormAnalytics({
                    formId,
                    totalSubmissions: 0,
                    completedSubmissions: 0,
                    partialSubmissions: 0,
                    completionRate: 0,
                    averageCompletionTimeMs: 0,
                    dropOffByQuestion: [],
                    submissionTimeline: []
                });
            }

            // Update stats
            const oldTotal = analytics.completedSubmissions || 0;
            const oldAvg = analytics.averageCompletionTimeMs || 0;

            analytics.totalSubmissions = (analytics.totalSubmissions || 0) + 1; // Assuming every submission viewed it? Or just submitted? 
            // Ideally 'totalSubmissions' usually means 'Views' or 'Starts' in many systems, 
            // but here schema says 'totalSubmissions'. Let's assume it means 'Total Attempts' (Starts). 
            // But we only track 'completed' submissions here.
            // We should increment totalSubmissions maybe when they START the form?
            // For now, let's assume totalSubmissions = completed + partial.
            // Since we only receive completed ones here:
            analytics.totalSubmissions += 1;
            analytics.completedSubmissions += 1;

            // Recalculate average time
            analytics.averageCompletionTimeMs = ((oldAvg * oldTotal) + completionTimeMs) / (oldTotal + 1);

            // Completion rate
            // We use 'views' (which tracks form opens) as the denominator, not 'totalSubmissions' (which tracks attempts/starts).
            const views = analytics.views || 0;
            analytics.completionRate = views > 0 ? Math.round((analytics.completedSubmissions / views) * 100) : 0;

            // Update Timeline
            const timelineEntry = analytics.submissionTimeline.find(t => new Date(t.date).getTime() === today.getTime());
            if (timelineEntry) {
                timelineEntry.count += 1;
            } else {
                analytics.submissionTimeline.push({ date: today, count: 1 });
            }

            // Drop-off rates requires tracking step-by-step limits.
            // We can't easily calculate exact drop-off without "view" events for each question.
            // We will skip drop-off update for now or just init it.

            await analytics.save();

        } catch (err) {
            console.error("Failed to update analytics:", err);
            // Don't fail the submission request just because analytics failed
        }

        return submission;
    }

    async getSubmissions(formId: string, filters: SubmissionFilters = {}): Promise<ISubmission[]> {
        await connectMongo();
        return await Submission.find({ formId, ...filters })
            .sort({ submittedAt: -1 });
    }

    async getSubmissionById(submissionId: string): Promise<ISubmission | null> {
        await connectMongo();
        return await Submission.findById(submissionId);
    }

    async getAnalytics(formId: string): Promise<IFormAnalytics> {
        await connectMongo();

        // Perform Aggregation
        const objectId = new mongoose.Types.ObjectId(formId);

        // 1. Basic Counts
        const stats = await Submission.aggregate([
            { $match: { formId: objectId } },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    completedSubmissions: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    partialSubmissions: {
                        $sum: { $cond: [{ $eq: ["$status", "partial"] }, 1, 0] }
                    },
                    avgTime: { $avg: "$completionTimeMs" }
                }
            }
        ]);

        const result = stats[0] || {
            totalSubmissions: 0,
            completedSubmissions: 0,
            partialSubmissions: 0,
            avgTime: 0
        };

        // Fetch persistent analytics to get the correct view count
        const persistentAnalytics = await FormAnalytics.findOne({ formId: objectId });
        const persistentViews = persistentAnalytics?.views || 0;

        // Construct a FormAnalytics object (in-memory) to satisfy the interface
        // We use the model constructor to ensure it has all methods and properties
        const analytics = new FormAnalytics({
            formId: objectId,
            totalSubmissions: result.totalSubmissions,
            completedSubmissions: result.completedSubmissions,
            partialSubmissions: result.partialSubmissions,
            // CORRECT FORMULA: Completed / Views (if views > 0)
            completionRate: persistentViews > 0 ? Math.round((result.completedSubmissions / persistentViews) * 100) : 0,
            averageCompletionTimeMs: result.avgTime,
            views: persistentViews, // Ensure we return the correct view count
            dropOffByQuestion: [],
            submissionTimeline: []
        });

        return analytics;
    }
}

export const submissionService = new SubmissionService();

