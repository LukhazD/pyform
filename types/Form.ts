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
    isConversational?: boolean;
    showProgressBar?: boolean;
    allowMultipleSubmissions?: boolean;
    requireAuth?: boolean;
    welcomeMessage?: string;
    thankYouMessage?: string;
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

export interface Form {
    _id: string;
    title: string;
    description?: string;
    settings?: FormSettings;
    styling?: FormStyling;
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
