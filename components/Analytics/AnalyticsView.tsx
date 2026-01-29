"use client";

import { IFormAnalytics } from "@/models/FormAnalytics";
import AnalyticsCards from "./AnalyticsCards";
import TimelineChart from "./TimelineChart";
import DropOffFunnel from "./DropOffFunnel";

interface AnalyticsViewProps {
    data: IFormAnalytics | null;
}

export default function AnalyticsView({ data }: AnalyticsViewProps) {
    if (!data) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500">No hay datos analíticos disponibles aún.</p>
            </div>
        );
    }

    return (
        <div className="py-6">
            <AnalyticsCards data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TimelineChart data={data} />
                </div>
                <div>
                    <DropOffFunnel data={data} />
                </div>
            </div>
        </div>
    );
}
