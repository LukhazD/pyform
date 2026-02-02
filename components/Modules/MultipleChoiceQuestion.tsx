/* eslint-disable no-unused-vars */
"use client";

import React from "react";
import { Card, RadioGroup, Radio } from "@heroui/react";

import { FormStyling } from "@/types/FormStyling";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    isRequired?: boolean;
    options?: Array<{ id: string; label: string; value: string; order: number }>;
}

interface MultipleChoiceQuestionProps {
    module: Module;
    value?: string;
    onChange?: (_v: string) => void;
    isPreview?: boolean;
    primaryColor?: string;
    radius?: FormStyling["heroUIRadius"];
    shadow?: FormStyling["heroUIShadow"];
}

export default function MultipleChoiceQuestion({ module, value, onChange, primaryColor, radius = "lg", shadow = "sm" }: MultipleChoiceQuestionProps) {
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
                            {module.title || "Opción múltiple"}
                            {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {module.description && (
                            <p className="text-gray-600">{module.description}</p>
                        )}
                    </div>

                    <RadioGroup
                        classNames={{ wrapper: "gap-3" }}
                        value={value || ""}
                        onValueChange={onChange}
                    >
                        {options.map((option, index) => (
                            <Radio
                                key={option.id}
                                value={option.value}
                                classNames={{
                                    base: "border-2 border-gray-200 rounded-xl p-4 hover:border-primary transition-colors data-[selected=true]:border-primary data-[selected=true]:bg-gray-50 max-w-full m-0",
                                    wrapper: "group-data-[selected=true]:border-primary",
                                    label: "text-lg",
                                }}
                                style={{
                                    // @ts-ignore
                                    "--nextui-primary": primaryColor,
                                }}
                            >
                                <span className="inline-flex items-center gap-3">
                                    <span
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                                        style={{
                                            backgroundColor: value === option.value ? primaryColor : "#f3f4f6",
                                            color: value === option.value ? "white" : "#4b5563"
                                        }}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    {option.label}
                                </span>
                            </Radio>
                        ))}
                    </RadioGroup>
                </div>
            </Card>
        </div>
    );
}
