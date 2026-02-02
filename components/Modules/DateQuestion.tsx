"use client";

import React from "react";
import { Card, DatePicker } from "@heroui/react";

import { FormStyling } from "@/types/FormStyling";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    isRequired?: boolean;
}

import { parseDate, getLocalTimeZone, today } from "@internationalized/date";

interface DateQuestionProps {
    module: Module;
    value?: string;
    onChange?: (_v: string) => void;
    isPreview?: boolean;
    primaryColor?: string;
    radius?: FormStyling["heroUIRadius"];
    shadow?: FormStyling["heroUIShadow"];
}

export default function DateQuestion({ module, value, onChange, primaryColor, radius = "lg", shadow = "sm" }: DateQuestionProps) {
    // Convert string value (YYYY-MM-DD) to CalendarDate object
    const dateValue = value ? parseDate(value) : null;

    const handleDateChange = (date: any) => {
        if (date) {
            // Convert CalendarDate to string (YYYY-MM-DD)
            onChange?.(date.toString());
        } else {
            onChange?.("");
        }
    };

    return (
        <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center p-4 md:p-8">
            <Card shadow={shadow} radius={radius === "full" ? "lg" : radius} className="max-w-2xl w-full p-6 md:p-10 bg-white">
                <div className="space-y-3">
                    <div>
                        <label className="text-xl md:text-2xl font-semibold text-gray-900 block mb-2">
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
                        value={dateValue}
                        onChange={handleDateChange}
                        classNames={{
                            base: "w-full",
                            inputWrapper: "border-2 border-gray-300 focus-within:border-primary",
                        }}
                    />
                </div>
            </Card>
        </div>
    );
}
