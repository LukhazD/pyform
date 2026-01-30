import mongoose, { Schema } from "mongoose";

// Sub-schemas
const dropOffRateSchema = new Schema(
    {
        questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        questionTitle: { type: String, required: true },
        order: { type: Number, required: true },
        viewCount: { type: Number, required: true },
        answerCount: { type: Number, required: true },
        dropOffRate: { type: Number, required: true },
    },
    { _id: false }
);

const timelineDataPointSchema = new Schema(
    {
        date: { type: Date, required: true },
        count: { type: Number, required: true },
    },
    { _id: false }
);

// IFormAnalytics Interface
export interface IStartDropOffData {
    questionId: mongoose.Types.ObjectId;
    questionTitle: string;
    order: number;
    viewCount: number;
    answerCount: number;
    dropOffRate: number;
}

export interface ITimelineData {
    date: Date;
    count: number;
}

export interface IFormAnalytics extends mongoose.Document {
    formId: mongoose.Types.ObjectId;
    totalSubmissions: number;
    completedSubmissions: number;
    partialSubmissions: number;
    completionRate: number;
    averageCompletionTimeMs: number;
    views: number;
    dropOffByQuestion: IStartDropOffData[];
    submissionTimeline: ITimelineData[];
    createdAt: Date;
    updatedAt: Date;

    // Methods
    getDropOffRate(questionId: string): number;
}

// MAIN ANALYTICS SCHEMA
const formAnalyticsSchema = new Schema(
    {
        formId: {
            type: Schema.Types.ObjectId,
            ref: "Form",
            required: true,
            unique: true, // One analytics document per form (snapshot or cache)
            index: true,
        },
        totalSubmissions: { type: Number, default: 0 },
        completedSubmissions: { type: Number, default: 0 },
        partialSubmissions: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        averageCompletionTimeMs: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        dropOffByQuestion: {
            type: [dropOffRateSchema],
            default: [],
        },
        submissionTimeline: {
            type: [timelineDataPointSchema],
            default: [],
        },
    },
    {
        timestamps: true, // Track when analytics were last updated
    }
);

// Instance Methods
formAnalyticsSchema.methods.getDropOffRate = function (questionId: string) {
    const data = this.dropOffByQuestion.find(
        (d: IStartDropOffData) => d.questionId.toString() === questionId
    );
    return data ? data.dropOffRate : 0;
};

const FormAnalytics = (mongoose.models.FormAnalytics || mongoose.model<IFormAnalytics>("FormAnalytics", formAnalyticsSchema)) as mongoose.Model<IFormAnalytics>;

export default FormAnalytics;
