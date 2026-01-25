"use client";

import React from "react";
import { Card, Input } from "@heroui/react";
import { Link } from "lucide-react";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
}

interface UrlQuestionProps {
    module: Module;
}

export default function UrlQuestion({ module }: UrlQuestionProps) {
    return (
        <Card shadow="sm" radius="lg" className="p-6 bg-white">
            <div className="space-y-3">
                <div>
                    <label className="text-lg font-medium text-gray-900">
                        {module.title || "URL"}
                        {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    )}
                </div>
                <Input
                    type="url"
                    placeholder={module.placeholder || "https://ejemplo.com"}
                    radius="full"
                    variant="bordered"
                    size="lg"
                    startContent={<Link className="text-gray-400" size={20} />}
                    classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 border-gray-300 focus-within:border-primary h-14",
                    }}
                />
            </div>
        </Card>
    );
}
