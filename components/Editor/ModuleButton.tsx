"use client";

import React from "react";

interface ModuleButtonProps {
    type: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    compact?: boolean;
}

export default function ModuleButton({
    type,
    label,
    icon,
    onClick,
    compact,
}: ModuleButtonProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("moduleType", type);
        e.dataTransfer.effectAllowed = "copy";
    };

    if (compact) {
        return (
            <button
                onClick={onClick}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-primary hover:bg-gray-50 active:scale-95 transition-all text-center"
            >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    {icon}
                </div>
                <span className="text-xs font-medium text-gray-700 leading-tight">
                    {label}
                </span>
            </button>
        );
    }

    return (
        <button
            draggable
            onDragStart={handleDragStart}
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-all cursor-move text-left"
        >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </button>
    );
}
