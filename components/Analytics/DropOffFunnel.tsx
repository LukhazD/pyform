"use client";

import { useEffect, useRef } from "react";
import { Card } from "@heroui/react";
import gsap from "gsap";
import { IFormAnalytics, IStartDropOffData } from "@/models/FormAnalytics";
import { ArrowDown } from "lucide-react";

interface DropOffFunnelProps {
    data: IFormAnalytics | null;
}

export default function DropOffFunnel({ data }: DropOffFunnelProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!data?.dropOffByQuestion?.length) return;

        const ctx = gsap.context(() => {
            gsap.from(".funnel-step", {
                x: -20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.2,
            });

            gsap.from(".progress-bar-fill", {
                width: 0,
                duration: 1.5,
                ease: "power2.out",
                delay: 0.8,
            });
        }, containerRef);

        return () => ctx.revert();
    }, [data]);

    if (!data?.dropOffByQuestion || data.dropOffByQuestion.length === 0) {
        return null;
    }

    const sortedQuestions = [...data.dropOffByQuestion].sort((a, b) => a.order - b.order);

    return (
        <Card ref={containerRef} className="p-6 border-none shadow-sm" radius="md">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análisis de Abandono</h3>

            <div className="space-y-6">
                {sortedQuestions.map((question, index) => {
                    // Calculate retention rate relative to the first question (or total starts)
                    // Visualizing "How many people reached this step"
                    // The schema gives us viewCount. Let's assume the first viewCount is the baseline (100%).
                    const baseline = sortedQuestions[0].viewCount;
                    const retentionRate = baseline > 0 ? (question.viewCount / baseline) * 100 : 0;

                    return (
                        <div key={index} className="funnel-step relative">
                            {/* Connector Line (except for last item) */}
                            {index < sortedQuestions.length - 1 && (
                                <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-100 -z-10 h-16"></div>
                            )}

                            <div className="flex items-center gap-4">
                                {/* Step Indicator */}
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 text-gray-500 font-medium">
                                    {index + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px] md:max-w-md">
                                            {question.questionTitle || `Pregunta ${index + 1}`}
                                        </h4>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-900">{question.viewCount}</span>
                                            <span className="text-xs text-gray-500 ml-1">vistas</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="progress-bar-fill h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                            style={{ width: `${retentionRate}%` }}
                                        ></div>
                                    </div>

                                    {/* Drop-off Info */}
                                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                                        <span>Retención: {retentionRate.toFixed(1)}%</span>
                                        {question.dropOffRate > 0 && (
                                            <span className="text-red-400 flex items-center">
                                                <ArrowDown size={10} className="mr-0.5" />
                                                {question.dropOffRate.toFixed(1)}% abandono
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
