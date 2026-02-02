"use client";

import React from "react";
import { Card, Input } from "@heroui/react";

import { FormStyling } from "@/types/FormStyling";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
}

interface NumberQuestionProps {
    module: Module;
    value?: number | "";
    onChange?: (_v: number | "") => void;
    isPreview?: boolean;
    radius?: FormStyling["heroUIRadius"];
    shadow?: FormStyling["heroUIShadow"];
}

export default function NumberQuestion({ module, value, onChange, radius = "lg", shadow = "sm" }: NumberQuestionProps) {
    return (
        <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center p-4 md:p-8">
            <Card shadow={shadow} radius={radius === "full" ? "lg" : radius} className="max-w-2xl w-full p-6 md:p-10 bg-white">
                <div className="space-y-3">
                    <div>
                        <label className="text-xl md:text-2xl font-semibold text-gray-900 block mb-2">
                            {module.title || "Ingrese un número"}
                            {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {module.description && (
                            <p className="text-gray-600">{module.description}</p>
                        )}
                    </div>

                    <Input
                        type="number"
                        placeholder={module.placeholder || "0"}
                        radius="full"
                        variant="bordered"
                        size="lg"
                        value={value?.toString() || ""}
                        onValueChange={(v) => onChange?.(v === "" ? "" : Number(v))}
                        classNames={{
                            input: "text-lg py-6",
                            inputWrapper: "border-2 border-gray-300 focus-within:border-primary h-14",
                        }}
                    />
                </div>
            </Card>
        </div>
    );
}
