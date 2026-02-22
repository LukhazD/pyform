"use client";

import React from "react";
import { Card, CheckboxGroup, Checkbox } from "@heroui/react";

import { FormStyling } from "@/types/FormStyling";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    isRequired?: boolean;
    options?: Array<{ id: string; label: string; value: string; order: number }>;
}

interface CheckboxesQuestionProps {
    module: Module;
    value?: string[];
    onChange?: (_v: string[]) => void;
    isPreview?: boolean;
    primaryColor?: string;
    radius?: FormStyling["heroUIRadius"];
    shadow?: FormStyling["heroUIShadow"];
}

export default function CheckboxesQuestion({ module, value, onChange, primaryColor, radius = "lg", shadow = "sm" }: CheckboxesQuestionProps) {
    const defaultOptions = [
        { id: "1", label: "Opción 1", value: "option1", order: 0 },
        { id: "2", label: "Opción 2", value: "option2", order: 1 },
        { id: "3", label: "Opción 3", value: "option3", order: 2 },
    ];

    const options = module.options || defaultOptions;

    return (
        <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center p-4 md:p-8">
            <Card shadow={shadow} radius={radius === "full" ? "lg" : radius} className="max-w-2xl w-full p-6 md:p-10 bg-white">
                <div className="space-y-6">
                    <div>
                        <label className="text-xl md:text-2xl font-semibold text-gray-900 block mb-2">
                            {module.title || "Casillas de verificación"}
                            {module.isRequired && <span className="text-primary ml-1">*</span>}
                        </label>
                        {module.description && (
                            <p className="text-gray-600">{module.description}</p>
                        )}
                    </div>
                    <CheckboxGroup
                        classNames={{ wrapper: "gap-3" }}
                        value={Array.isArray(value) ? value : []}
                        onValueChange={onChange}
                    >
                        {options.map((option) => (
                            <Checkbox
                                key={option.id}
                                value={option.value}
                                radius="md"
                                classNames={{
                                    base: "border-2 border-gray-200 rounded-xl p-4 data-[selected=true]:border-primary data-[selected=true]:bg-gray-100 max-w-full m-0 hover:bg-gray-50 transition-all",
                                    wrapper: "after:bg-primary group-data-[selected=true]:border-primary text-lg",
                                    label: "text-lg w-full",
                                }}
                            >
                                {option.label}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                </div>
            </Card>
        </div>
    );
}
