"use client";

import React from "react";

interface ModuleButtonProps {
    type: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export default function ModuleButton({
    type,
    label,
    icon,
    onClick,
}: ModuleButtonProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("moduleType", type);
        e.dataTransfer.effectAllowed = "copy";
    };

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
