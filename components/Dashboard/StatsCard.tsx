import React from "react";
import { Card } from "@heroui/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: "green" | "purple" | "default";
}

export default function StatsCard({
    label,
    value,
    icon,
    trend,
    variant = "default"
}: StatsCardProps) {
    const bgStyles = {
        purple: "bg-gray-50",
        green: "bg-gray-100",
        default: "bg-white",
    };

    const iconBgStyles = {
        purple: "bg-gray-500",
        green: "bg-primary",
        default: "bg-gray-900",
    };

    const trendColor = trend?.isPositive ? "text-gray-600" : "text-gray-500";

    return (
        <Card
            shadow="sm"
            radius="md"
            className={`p-6 ${bgStyles[variant]}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>

                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className={`text-sm font-medium ${trendColor}`}>
                                {trend.isPositive ? "+" : ""}{trend.value}%
                            </span>
                            {trend.isPositive ? (
                                <TrendingUp size={14} className={trendColor} />
                            ) : trend.value === 0 ? (
                                <Minus size={14} className="text-gray-400" />
                            ) : (
                                <TrendingDown size={14} className={trendColor} />
                            )}
                            <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
                        </div>
                    )}
                </div>

                <div className={`w-12 h-12 rounded-full ${iconBgStyles[variant]} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white">{icon}</span>
                </div>
            </div>
        </Card>
    );
}
