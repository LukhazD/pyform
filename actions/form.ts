"use server";

import connectMongo from "@/libs/mongoose";
import FormAnalytics from "@/models/FormAnalytics";

export async function incrementFormViews(formId: string) {
    if (!formId) return { error: "Form ID is required" };

    try {
        await connectMongo();

        // Use findOneAndUpdate with upsert to ensure the record exists
        await FormAnalytics.findOneAndUpdate(
            { formId: formId },
            {
                $inc: { views: 1 },
                $setOnInsert: {
                    totalSubmissions: 0,
                    completedSubmissions: 0,
                    partialSubmissions: 0,
                    completionRate: 0,
                    averageCompletionTimeMs: 0
                }
            },
            { upsert: true, new: true }
        );

        return { success: true };
    } catch (error) {
        console.error("Error incrementing form views:", error);
        return { error: "Failed to increment views" };
    }
}
