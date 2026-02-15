import mongoose, { Schema } from "mongoose";

// Sub-schemas
const formSettingsSchema = new Schema(
    {
        isConversational: { type: Boolean, default: false },
        showProgressBar: { type: Boolean, default: true },
        allowMultipleSubmissions: { type: Boolean, default: true },
        requireAuth: { type: Boolean, default: false },
        welcomeMessage: { type: String, default: "Welcome! Please take a moment to fill out this form." },
        thankYouMessage: { type: String, default: "Thank you for your submission!" },
        redirectUrl: { type: String },
        notificationEmail: { type: String },
    },
    { _id: false }
);

const formStylingSchema = new Schema(
    {
        primaryColor: { type: String, default: "#1a1a1a" },
        fontFamily: { type: String, default: "Inter" },
        heroUIRadius: {
            type: String,
            enum: ["none", "sm", "md", "lg", "full"],
            default: "full",
        },
        heroUIShadow: {
            type: String,
            enum: ["none", "sm", "md", "lg"],
            default: "sm",
        },
        customCSS: { type: String },
    },
    { _id: false }
);

// IForm Interface
export interface FormSettings {
    isConversational: boolean;
    showProgressBar: boolean;
    allowMultipleSubmissions: boolean;
    requireAuth: boolean;
    welcomeMessage: string;
    thankYouMessage: string;
    redirectUrl?: string;
    notificationEmail?: string;
}

export interface FormStyling {
    primaryColor: string;
    fontFamily: string;
    heroUIRadius: "none" | "sm" | "md" | "lg" | "full";
    heroUIShadow: "none" | "sm" | "md" | "lg";
    customCSS?: string;
}

import { IQuestion } from "./Question";

export interface IForm extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    status: "draft" | "published" | "closed";
    shortId: string;
    settings: FormSettings;
    styling: FormStyling;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    getQuestions(): Promise<IQuestion[]>;
    getSubmissionCount(): Promise<number>;
    getCompletionRate(): Promise<number>;
}

// MAIN FORM SCHEMA
const formSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["draft", "published", "closed"],
            default: "draft",
            index: true,
        },
        shortId: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        settings: {
            type: formSettingsSchema,
            default: () => ({}),
        },
        styling: {
            type: formStylingSchema,
            default: () => ({}),
        },
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
formSchema.index({ userId: 1, createdAt: -1 });

// Instance Methods
formSchema.methods.getQuestions = async function () {
    const Question = mongoose.models.Question;
    if (!Question) return [];
    return await Question.find({ formId: this._id }).sort({ order: 1 });
};

formSchema.methods.getSubmissionCount = async function () {
    const Submission = mongoose.models.Submission;
    if (!Submission) return 0;
    return await Submission.countDocuments({ formId: this._id });
};

formSchema.methods.getCompletionRate = async function () {
    const Submission = mongoose.models.Submission;
    if (!Submission) return 0;

    // Implementation logic for rate calculation
    const total = await Submission.countDocuments({ formId: this._id });
    if (total === 0) return 0;

    const completed = await Submission.countDocuments({ formId: this._id, status: 'completed' });
    return completed / total;
};

const Form = (mongoose.models.Form || mongoose.model<IForm>("Form", formSchema)) as mongoose.Model<IForm>;

export default Form;
