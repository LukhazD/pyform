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

interface NumberQuestionProps {
    module: Module;
}

export default function NumberQuestion({ module }: NumberQuestionProps) {
    return (
        <Card shadow="sm" radius="lg" className="p-6 bg-white">
            <div className="space-y-3">
                <div>
                    <label className="text-lg font-medium text-gray-900">
                        {module.title || "Número"}
                        {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    )}
                </div>
                <Input
                    type="number"
                    placeholder={module.placeholder || "0"}
                    radius="full"
                    variant="bordered"
                    size="lg"
                    classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 border-gray-300 focus-within:border-primary",
                    }}
                />
            </div>
        </Card>
    );
}
