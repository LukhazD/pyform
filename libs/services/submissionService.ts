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

        // Construct a FormAnalytics object (in-memory) to satisfy the interface
        // We use the model constructor to ensure it has all methods and properties
        const analytics = new FormAnalytics({
            formId: objectId,
            totalSubmissions: result.totalSubmissions,
            completedSubmissions: result.completedSubmissions,
            partialSubmissions: result.partialSubmissions,
            completionRate: result.totalSubmissions > 0 ? result.completedSubmissions / result.totalSubmissions : 0,
            averageCompletionTimeMs: result.avgTime,
            dropOffByQuestion: [],
            submissionTimeline: []
        });

        return analytics;
    }
}

export const submissionService = new SubmissionService();

