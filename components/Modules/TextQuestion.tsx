/* eslint-disable no-unused-vars */
"use client";

import React from "react";
import { Card, Input } from "@heroui/react";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
}

interface TextQuestionProps {
    module: Module;
    value?: string;
    onChange?: (_v: string) => void;
    isPreview?: boolean;
}

export default function TextQuestion({ module, value, onChange }: TextQuestionProps) {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <Card shadow="sm" radius="lg" className="max-w-2xl w-full p-10 bg-white">
                <div className="space-y-6">
                    <div>
                        <label className="text-2xl font-semibold text-gray-900 block mb-2">
                            {module.title || "Pregunta sin título"}
                            {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {module.description && (
                            <p className="text-gray-600">{module.description}</p>
                        )}
                    </div>

                    <Input
                        placeholder={module.placeholder || "Escribe tu respuesta..."}
                        radius="full"
                        variant="bordered"
                        size="lg"
                        value={value || ""}
                        onValueChange={onChange}
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
