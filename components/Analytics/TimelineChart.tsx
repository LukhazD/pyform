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
    const maxCount = Math.max(...sortedData.map(d => d.count), 1);

    return (
        <Card ref={containerRef} className="p-6 mb-8 border-none shadow-sm" radius="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actividad de Respuestas</h3>

            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
                {sortedData.map((item, index) => {
                    const heightPercentage = (item.count / maxCount) * 100;
                    const date = new Date(item.date);
                    const dateLabel = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 group relative">
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-gray-900 text-white text-xs rounded py-1 px-2 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {item.count} respuestas el {date.toLocaleDateString('es-ES')}
                            </div>

                            {/* Bar */}
                            <div
                                className="timeline-bar w-full max-w-[40px] bg-purple-100 hover:bg-purple-500 transition-colors duration-300 rounded-t-lg min-h-[4px]"
                                style={{ height: `${heightPercentage}%` }}
                            ></div>

                            {/* Label */}
                            <span className="text-xs text-gray-400 mt-2 truncate w-full text-center">{dateLabel}</span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
