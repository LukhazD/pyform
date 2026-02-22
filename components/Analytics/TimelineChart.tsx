"use client";

import { useEffect, useRef } from "react";
import { Card } from "@heroui/react";
import gsap from "gsap";
import { IFormAnalytics, ITimelineData } from "@/models/FormAnalytics";

interface TimelineChartProps {
    data: IFormAnalytics | null;
}

export default function TimelineChart({ data }: TimelineChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!data?.submissionTimeline?.length) return;

        const ctx = gsap.context(() => {
            gsap.from(".timeline-bar", {
                height: 0,
                duration: 1,
                stagger: 0.05,
                ease: "power2.out",
                delay: 0.5,
            });
        }, containerRef);

        return () => ctx.revert();
    }, [data]);

    if (!data?.submissionTimeline || data.submissionTimeline.length === 0) {
        return null;
    }

    // Sort by date just in case
    const sortedData = [...data.submissionTimeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Calculate a "nice" max for the chart Y-axis (e.g. next multiple of 5)
    let maxData = Math.max(...sortedData.map(d => d.count), 0);
    const maxCount = maxData === 0 ? 5 : Math.ceil(maxData / 5) * 5;

    return (
        <Card ref={containerRef} className="p-6 border-none shadow-sm" radius="md">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actividad de Respuestas</h3>

            <div className="flex gap-4 h-64">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-xs text-gray-400 py-2 h-full text-right w-8">
                    <span>{Math.ceil(maxCount)}</span>
                    <span>{Math.ceil(maxCount / 2)}</span>
                    <span>0</span>
                </div>

                {/* Chart Area */}
                <div className="relative flex-1 h-full border-l border-b border-gray-100">
                    {/* Horizontal Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div className="w-full h-px bg-gray-100 border-t border-dashed border-gray-200" />
                        <div className="w-full h-px bg-gray-100 border-t border-dashed border-gray-200" />
                        <div className="w-full h-px" /> {/* Bottom line handled by container border */}
                    </div>

                    {/* Bars Container */}
                    <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pb-[1px]">
                        {sortedData.map((item, index) => {
                            const heightPercentage = (item.count / maxCount) * 100;
                            const date = new Date(item.date);
                            const dateLabel = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

                            return (
                                <div key={index} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                        {item.count} respuestas el {date.toLocaleDateString('es-ES')}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>

                                    {/* Bar wrapper for hover effect area */}
                                    <div className="w-full flex justify-end flex-col items-center h-full relative z-10 group-hover:scale-x-110 transition-transform">
                                        {/* Bar */}
                                        <div
                                            className="timeline-bar w-full max-w-[30px] bg-purple-500/80 hover:bg-purple-600 transition-all duration-300 rounded-t-sm"
                                            style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                        ></div>
                                    </div>

                                    {/* X-Axis Label */}
                                    <div className="absolute top-full mt-3 text-[10px] text-gray-400 truncate w-full text-center">
                                        {dateLabel}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Card>
    );
}
