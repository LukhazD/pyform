"use client";

import React from "react";
import { Card, Textarea } from "@heroui/react";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
}

interface TextareaQuestionProps {
    module: Module;
}

export default function TextareaQuestion({ module }: TextareaQuestionProps) {
    return (
        <Card shadow="sm" radius="lg" className="p-6 bg-white">
            <div className="space-y-3">
                <div>
                    <label className="text-lg font-medium text-gray-900">
                        {module.title || "Texto largo"}
                        {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    )}
                </div>
                <Textarea
                    placeholder={module.placeholder || "Escribe tu respuesta aquí..."}
                    radius="lg"
                    variant="bordered"
                    minRows={4}
                    classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 border-gray-300 focus-within:border-primary",
                    }}
                />
            </div>
        </Card>
    );
}
