import { IFormAnalytics } from "@/models/FormAnalytics";

export interface FormStats {
    formId: string;
    title: string;
    shortId: string;
    views: number;
    submissions: number;
    completedSubmissions: number;
    completionRate: number;
}

export interface GlobalAnalyticsResponse {
    aggregated: IFormAnalytics;
    formsWithStats: FormStats[];
}
