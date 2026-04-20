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

        // Server-side enforcement of "no multiple submissions" setting.
        // Uses IP as identifier since respondents are typically unauthenticated.
        if (form.settings?.allowMultipleSubmissions === false && metadata.ipAddress) {
            const existing = await Submission.findOne({
                formId: new mongoose.Types.ObjectId(formId),
                "metadata.ipAddress": metadata.ipAddress,
            });
            if (existing) {
                throw new Error("DUPLICATE_SUBMISSION");
            }
        }

        // Enforce response-per-form limit atomically using findOneAndUpdate
        // with a condition. This prevents TOCTOU races where two concurrent
        // submissions both pass a count check before either inserts.
        const formObjectId = new mongoose.Types.ObjectId(formId);
        const reserveSlot = await FormAnalytics.findOneAndUpdate(
            {
                formId: formObjectId,
                completedSubmissions: { $lt: RESPONSES_PER_FORM_LIMIT },
            },
            { $inc: { completedSubmissions: 1, totalSubmissions: 1 } },
            { new: true, upsert: false }
        );

        if (!reserveSlot) {
            // Either the analytics doc doesn't exist yet (first submission) or limit reached.
            // Use upsert with $setOnInsert to atomically create-or-fail for new forms.
            const upsertResult = await FormAnalytics.findOneAndUpdate(
                { formId: formObjectId, completedSubmissions: { $lt: RESPONSES_PER_FORM_LIMIT } },
                {
                    $inc: { completedSubmissions: 1, totalSubmissions: 1 },
                    $setOnInsert: {
                        formId: formObjectId,
                        partialSubmissions: 0,
                        completionRate: 0,
                        averageCompletionTimeMs: 0,
                        views: 0,
                        dropOffByQuestion: [],
                        submissionTimeline: [],
                    },
                },
                { new: true, upsert: true }
            ).catch((err: any): null => {
                // E11000 duplicate key on concurrent first-submission race:
                // another request just created the doc. Retry the conditional update.
                if (err?.code === 11000) return null;
                throw err;
            });

            if (!upsertResult) {
                // Retry once after duplicate key (the doc now exists)
                const retryResult = await FormAnalytics.findOneAndUpdate(
                    { formId: formObjectId, completedSubmissions: { $lt: RESPONSES_PER_FORM_LIMIT } },
                    { $inc: { completedSubmissions: 1, totalSubmissions: 1 } },
                    { new: true }
                );
                if (!retryResult) {
                    throw new Error(`FORM_RESPONSE_LIMIT_REACHED:${RESPONSES_PER_FORM_LIMIT}`);
                }
            }
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
            formVersion: form.formVersion || 1,
        });

        // Update remaining analytics fields (counters already incremented atomically above)
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Update averageCompletionTimeMs and completionRate
            // (totalSubmissions/completedSubmissions already incremented by the atomic reserve above)
            await FormAnalytics.updateOne(
                { formId: formObjectId },
                [
                    {
                        $set: {
                            averageCompletionTimeMs: {
                                $cond: {
                                    if: { $lte: ["$completedSubmissions", 1] },
                                    then: completionTimeMs,
                                    else: {
                                        $divide: [
                                            {
                                                $add: [
                                                    { $multiply: ["$averageCompletionTimeMs", { $subtract: ["$completedSubmissions", 1] }] },
                                                    completionTimeMs
                                                ]
                                            },
                                            "$completedSubmissions"
                                        ]
                                    }
                                }
                            },
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

            // Timeline Array Update
            const timelineUpdateResult = await FormAnalytics.updateOne(
                { formId: formObjectId, "submissionTimeline.date": today },
                { $inc: { "submissionTimeline.$.count": 1 } }
            );

            if (timelineUpdateResult.modifiedCount === 0) {
                await FormAnalytics.updateOne(
                    { formId: formObjectId },
                    { $push: { submissionTimeline: { date: today, count: 1 } } }
                );
            }

        } catch (err) {
            console.error("Failed to update analytics:", err);
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

