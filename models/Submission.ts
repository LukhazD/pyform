import mongoose, { Schema } from "mongoose";

// Sub-schemas
const answerSchema = new Schema(
    {
        questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        questionType: {
            type: String,
            required: true,
            // Validation against allowed types handled by service or Question model logic
        },
        value: {
            type: Schema.Types.Mixed, // Can be string, number, array, etc.
            required: true,
        },
        answeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const submissionMetadataSchema = new Schema(
    {
        ipAddress: { type: String },
        userAgent: { type: String, required: true },
        referrer: { type: String },
        utmParams: {
            type: Map,
            of: String,
        },
        deviceType: {
            type: String,
            enum: ["desktop", "mobile", "tablet"],
            required: true,
        },
        browser: { type: String, required: true },
    },
    { _id: false }
);

// Strict Typed Interfaces
export interface SubmissionMetadata {
    ipAddress?: string;
    userAgent: string;
    referrer?: string;
    utmParams?: Map<string, string>;
    deviceType: "desktop" | "mobile" | "tablet";
    browser: string;
}

export type AnswerValue = string | number | boolean | string[] | Record<string, unknown> | null;

export interface Answer {
    questionId: mongoose.Types.ObjectId;
    questionType: string;
    value: AnswerValue;
    answeredAt: Date;
}

export interface SubmissionFilters {
    status?: "completed" | "partial";
    "metadata.deviceType"?: string;
    "metadata.browser"?: string;
    // Add other filterable fields as needed
}

export interface ISubmission extends mongoose.Document {
    formId: mongoose.Types.ObjectId;
    answers: Answer[];
    metadata: SubmissionMetadata;
    status: "completed" | "partial";
    submittedAt: Date;
    completionTimeMs: number;

    // Methods
    getAnswer(questionId: string): Answer | undefined;
}

// MAIN SUBMISSION SCHEMA
const submissionSchema = new Schema(
    {
        formId: {
            type: Schema.Types.ObjectId,
            ref: "Form",
            required: true,
            index: true,
        },
        answers: {
            type: [answerSchema],
            default: [],
        },
        metadata: {
            type: submissionMetadataSchema,
            required: true,
        },
        status: {
            type: String,
            enum: ["completed", "partial"],
            required: true,
            index: true,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        completionTimeMs: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: false, // We use submittedAt
    }
);

// Indexes
submissionSchema.index({ formId: 1, submittedAt: -1 });
submissionSchema.index({ "answers.questionId": 1 });

// Instance Methods
submissionSchema.methods.getAnswer = function (questionId: string) {
    return this.answers.find((a: Answer) => a.questionId.toString() === questionId);
};

const Submission = (mongoose.models.Submission || mongoose.model<ISubmission>("Submission", submissionSchema)) as mongoose.Model<ISubmission>;

export default Submission;
