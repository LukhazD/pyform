import Submission, { ISubmission, Answer, SubmissionMetadata, SubmissionFilters } from "@/models/Submission";
import FormAnalytics, { IFormAnalytics, IStartDropOffData, ITimelineData } from "@/models/FormAnalytics";
import Form from "@/models/Form";
import User from "@/models/User";
import connectMongo from "@/libs/mongoose";
import mongoose from "mongoose";
import { hasActiveProAccess } from "@/libs/subscriptionUtils";
import { RESPONSES_PER_FORM_LIMIT } from "@/libs/planLimits";

export interface ISubmissionService {
    submitResponse(formId: string, answers: Answer[], metadata: SubmissionMetadata, completionTimeMs?: number): Promise<ISubmission>;
    getSubmissions(formId: string, filters?: SubmissionFilters): Promise<ISubmission[]>;
    getSubmissionById(submissionId: string): Promise<ISubmission | null>;
    getAnalytics(formId: string): Promise<IFormAnalytics>;
}

class SubmissionService implements ISubmissionService {
    async submitResponse(formId: string, answers: Answer[], metadata: SubmissionMetadata, completionTimeMs: number = 0): Promise<ISubmission> {
        await connectMongo();

        // Check if form owner has active subscription
        const form = await Form.findById(formId);
        if (!form) {
            throw new Error("Formulario no encontrado");
        }

        const owner = await User.findById(form.userId);
        if (!owner || !hasActiveProAccess(owner)) {
            throw new Error("Este formulario no está disponible temporalmente");
        }

        // Enforce response-per-form limit
        const analytics = await FormAnalytics.findOne({ formId });
        const currentResponses = analytics?.completedSubmissions ?? 0;
        if (currentResponses >= RESPONSES_PER_FORM_LIMIT) {
            throw new Error(`Este formulario ha alcanzado el límite de ${RESPONSES_PER_FORM_LIMIT} respuestas.`);
        }

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

        // Update Analytics Atomically
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Create initial analytics doc if it doesn't exist (Upsert dummy)
            await FormAnalytics.updateOne(
                { formId },
                { $setOnInsert: { formId, totalSubmissions: 0, completedSubmissions: 0, partialSubmissions: 0, completionRate: 0, averageCompletionTimeMs: 0, views: 0, dropOffByQuestion: [], submissionTimeline: [] } },
                { upsert: true }
            );

            // 1. Atomic Math Update using Aggregation Pipeline
            await FormAnalytics.updateOne(
                { formId },
                [
                    {
                        $set: {
                            totalSubmissions: { $add: [{ $ifNull: ["$totalSubmissions", 0] }, 1] },
                            completedSubmissions: { $add: [{ $ifNull: ["$completedSubmissions", 0] }, 1] },
                            averageCompletionTimeMs: {
                                $cond: {
                                    if: { $eq: [{ $ifNull: ["$completedSubmissions", 0] }, 0] },
                                    then: completionTimeMs,
                                    else: {
                                        $divide: [
                                            {
                                                $add: [
                                                    { $multiply: [{ $ifNull: ["$averageCompletionTimeMs", 0] }, "$completedSubmissions"] },
                                                    completionTimeMs
                                                ]
                                            },
                                            { $add: ["$completedSubmissions", 1] }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $set: {
                            completionRate: {
                                $cond: {
                                    if: { $gt: [{ $ifNull: ["$views", 0] }, 0] },
                                    then: { $round: [{ $multiply: [{ $divide: ["$completedSubmissions", "$views"] }, 100] }] },
                                    else: 0
                                }
                            }
                        }
                    }
                ]
            );

            // 2. Timeline Array Update (Fast non-pipeline atomic update)
            const timelineUpdateResult = await FormAnalytics.updateOne(
                { formId, "submissionTimeline.date": today },
                { $inc: { "submissionTimeline.$.count": 1 } }
            );

            // If the date didn't exist in the array, push it
            if (timelineUpdateResult.modifiedCount === 0) {
                await FormAnalytics.updateOne(
                    { formId },
                    { $push: { submissionTimeline: { date: today, count: 1 } } }
                );
            }

        } catch (err) {
            console.error("Failed to update analytics atomically:", err);
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

