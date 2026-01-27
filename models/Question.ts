import mongoose, { Schema } from "mongoose";

// Enums
export const questionTypes = [
    "TEXT",
    "EMAIL",
    "NUMBER",
    "PHONE",
    "URL",
    "TEXTAREA",
    "MULTIPLE_CHOICE",
    "CHECKBOXES",
    "DROPDOWN",
    "DATE",
    "FILE_UPLOAD",
    "WELCOME",
    "QUOTE",
    "GOODBYE",
] as const;

export type QuestionType = (typeof questionTypes)[number];

// Strict Typed Interfaces
export interface ValidationRules {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    fileTypes?: string[];
    maxFileSize?: number;
    customErrorMessage?: string;
}

export interface QuestionOption {
    id: string;
    label: string;
    value: string;
    order: number;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string; // implied by UML theory typically, or just boolean
}

export interface IQuestion extends mongoose.Document {
    formId: mongoose.Types.ObjectId;
    type: QuestionType;
    order: number;
    title: string;
    description?: string;
    isRequired: boolean;
    validation: ValidationRules;
    options?: QuestionOption[];
    placeholder?: string;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    validateAnswer(answer: unknown): ValidationResult;
}

// Sub-schemas
const validationRulesSchema = new Schema(
    {
        minLength: { type: Number },
        maxLength: { type: Number },
        pattern: { type: String },
        min: { type: Number },
        max: { type: Number },
        fileTypes: [{ type: String }],
        maxFileSize: { type: Number },
        customErrorMessage: { type: String },
    },
    { _id: false }
);

const questionOptionSchema = new Schema(
    {
        id: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: String, required: true },
        order: { type: Number, required: true },
    },
    { _id: false }
);

// MAIN QUESTION SCHEMA
const questionSchema = new Schema(
    {
        formId: {
            type: Schema.Types.ObjectId,
            ref: "Form",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: questionTypes,
            required: true,
        },
        order: {
            type: Number,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        isRequired: {
            type: Boolean,
            default: false,
        },
        validation: {
            type: validationRulesSchema,
            default: {},
        },
        options: {
            type: [questionOptionSchema],
            default: undefined, // Only for relevant types
        },
        placeholder: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
questionSchema.index({ formId: 1, order: 1 });

// Instance Methods
questionSchema.methods.validateAnswer = function (answer: unknown): ValidationResult {
    // Implementation of validation logic would go here
    // For now return dummy result or throw error if invalid
    // Returning generic structure for now
    return { isValid: true };
};

const Question = (mongoose.models.Question || mongoose.model<IQuestion>("Question", questionSchema)) as mongoose.Model<IQuestion>;

export default Question;
