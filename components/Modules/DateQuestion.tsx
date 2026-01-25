"use client";

import React from "react";
import { Card, DatePicker } from "@heroui/react";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    isRequired?: boolean;
}

interface DateQuestionProps {
    module: Module;
}

export default function DateQuestion({ module }: DateQuestionProps) {
    return (
        <Card shadow="sm" radius="lg" className="p-6 bg-white">
            <div className="space-y-3">
                <div>
                    <label className="text-lg font-medium text-gray-900">
                        {module.title || "Fecha"}
                        {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    )}
                </div>
                <DatePicker
                    radius="full"
                    variant="bordered"
                    size="lg"
                    classNames={{
                        base: "w-full",
                        inputWrapper: "border-2 border-gray-300 focus-within:border-primary",
                    }}
                />
            </div>
        </Card>
    );
}
