import { IFormAnalytics, ITimelineData } from "@/models/FormAnalytics";

export function aggregateAnalytics(analyticsList: IFormAnalytics[]): IFormAnalytics {
    const totalSubmissions = analyticsList.reduce((acc, curr) => acc + (curr.totalSubmissions || 0), 0);
    const completedSubmissions = analyticsList.reduce((acc, curr) => acc + (curr.completedSubmissions || 0), 0);
    const views = analyticsList.reduce((acc, curr) => acc + (curr.views || 0), 0);

    // Average completion rate: (Total Completed / Views) * 100
    // If usage of views is preferred for "conversion rate". 
    // If strict "completion rate" of STARTS is desired, keep using totalSubmissions.
    // However, User complained about "Vistas" being double. "Vistas" usually means Page Views.
    // So "Completion Rate" usually implies "Conversion Rate" (Completes / Views).
    const completionRate = views > 0
        ? Math.round((completedSubmissions / views) * 100)
        : 0;


    // Average time (weighted by completed submissions)
    const totalTime = analyticsList.reduce((acc, curr) => acc + ((curr.averageCompletionTimeMs || 0) * (curr.completedSubmissions || 0)), 0);
    const averageCompletionTimeMs = completedSubmissions > 0 ? Math.round(totalTime / completedSubmissions) : 0;

    // Merge timelines
    const timelineMap = new Map<string, number>();
    analyticsList.forEach(a => {
        a.submissionTimeline?.forEach(t => {
            const dateStr = new Date(t.date).toISOString().split('T')[0];
            timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + t.count);
        });
    });

    const submissionTimeline: ITimelineData[] = Array.from(timelineMap.entries()).map(([date, count]) => ({
        date: new Date(date),
        count
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Partial submissions
    const partialSubmissions = analyticsList.reduce((acc, curr) => acc + (curr.partialSubmissions || 0), 0);

    return {
        totalSubmissions,
        completedSubmissions,
        partialSubmissions,
        completionRate,
        averageCompletionTimeMs,
        views,
        submissionTimeline,
        dropOffByQuestion: [], // Not applicable for global View
        formId: "global" as any,
    } as IFormAnalytics;
}
