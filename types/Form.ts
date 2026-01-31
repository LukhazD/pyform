export interface QuestionOption {
    id: string;
    label: string;
    value: string;
    order: number;
}

export interface Question {
    _id: string;
    type: string;
    order: number;
    title: string;
    description?: string;
    placeholder?: string;
    isRequired: boolean;
    options?: QuestionOption[];
}

export interface FormSettings {
    welcomeMessage?: string;
    thankYouMessage?: string;
    showProgressBar?: boolean;
}

export interface Form {
    _id: string;
    title: string;
    description?: string;
    settings?: FormSettings;
}

export interface SubmissionData {
    formId: string;
    answers: {
        questionId: string;
        questionType: string;
        value: any;
    }[];
    metadata: {
        userAgent: string;
        language: string;
        deviceType: string;
        browser: string;
    };
}
