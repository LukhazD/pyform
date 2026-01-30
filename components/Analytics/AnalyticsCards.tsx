"use client";

import { useEffect, useRef } from "react";
import { Card } from "@heroui/react";
import gsap from "gsap";
import { IFormAnalytics } from "@/models/FormAnalytics";
import { MousePointerClick, CheckCircle, Clock, Percent } from "lucide-react";

interface AnalyticsCardsProps {
    data: IFormAnalytics | null;
}

export default function AnalyticsCards({ data }: AnalyticsCardsProps) {
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate cards entry
            gsap.from(".analytics-card", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
            });

            // Animate numbers
            if (data) {
                const targets = [
                    { val: data.views, selector: ".stat-total" },
                    { val: data.completedSubmissions, selector: ".stat-completed" },
                    { val: data.completionRate, selector: ".stat-rate", suffix: "%" },
                    { val: data.averageCompletionTimeMs / 1000, selector: ".stat-time", suffix: "s" },
                ];

                targets.forEach((t) => {
                    // Use scoped selector provided by gsap.context if possible, or simple querySelector within ref
                    const els = cardsRef.current?.querySelectorAll(t.selector);
                    if (els && els.length > 0) {
                        els.forEach((el) => {
                            gsap.to(el, {
                                innerHTML: t.val,
                                duration: 1.5,
                                ease: "power2.out",
                                snap: { innerHTML: 1 }, // Snap to integer
                                onUpdate: function () {
                                    el.innerHTML = Math.round(Number(this.targets()[0].innerHTML)) + (t.suffix || "");
                                },
                            });
                        });
                    }
                });
            }
        }, cardsRef);

        return () => ctx.revert();
    }, [data]);

    const stats = [
        {
            title: "Total Vistas",
            value: data?.views || 0,
            icon: MousePointerClick,
            className: "stat-total",
            color: "text-blue-500",
            bgColor: "bg-blue-50",
        },
        {
            title: "Completados",
            value: data?.completedSubmissions || 0,
            icon: CheckCircle,
            className: "stat-completed",
            color: "text-green-500",
            bgColor: "bg-green-50",
        },
        {
            title: "Tasa de Finalización",
            value: (data?.completionRate || 0) + "%",
            icon: Percent,
            className: "stat-rate",
            color: "text-purple-500",
            bgColor: "bg-purple-50",
        },
        {
            title: "Tiempo Promedio",
            value: ((data?.averageCompletionTimeMs || 0) / 1000).toFixed(0) + "s",
            icon: Clock,
            className: "stat-time",
            color: "text-orange-500",
            bgColor: "bg-orange-50",
        },
    ];

    return (
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <Card key={index} className="analytics-card p-6 border-none shadow-sm hover:shadow-md transition-shadow duration-300" radius="lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <h3 className={`text-3xl font-bold text-gray-900 ${stat.className}`}>
                                0
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
