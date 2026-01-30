"use client";

import React from "react";
import { Card, Input } from "@heroui/react";
import { Mail } from "lucide-react";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
}

interface EmailQuestionProps {
    module: Module;
    value?: string;
    onChange?: (_val: string) => void;
    isPreview?: boolean;
}

export default function EmailQuestion({ module, value, onChange }: EmailQuestionProps) {
    return (
        <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center p-4 md:p-8">
            <Card shadow="sm" radius="lg" className="max-w-2xl w-full p-6 md:p-10 bg-white">
                <div className="space-y-3">
                    <div>
                        <label className="text-xl md:text-2xl font-semibold text-gray-900 block mb-2">
                            {module.title || "Email"}
                            {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {module.description && (
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                    </div>
                    <Input
                        type="email"
                        placeholder={module.placeholder || "tu@email.com"}
                        radius="full"
                        variant="bordered"
                        size="lg"
                        value={value || ""}
                        onValueChange={onChange}
                        startContent={<Mail className="text-gray-400" size={20} />}
                        classNames={{
                            input: "text-base",
                            inputWrapper: "border-2 border-gray-300 focus-within:border-primary",
                        }}
                    />
                </div>
            </Card>
        </div>
    );
}
