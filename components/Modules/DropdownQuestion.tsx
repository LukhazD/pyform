"use client";

import React from "react";
import { Card, Select, SelectItem } from "@heroui/react";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    isRequired?: boolean;
    options?: Array<{ id: string; label: string; value: string; order: number }>;
}

interface DropdownQuestionProps {
    module: Module;
}

export default function DropdownQuestion({ module }: DropdownQuestionProps) {
    const defaultOptions = [
        { id: "1", label: "Opción 1", value: "option1", order: 0 },
        { id: "2", label: "Opción 2", value: "option2", order: 1 },
        { id: "3", label: "Opción 3", value: "option3", order: 2 },
    ];

    const options = module.options || defaultOptions;

    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <Card shadow="sm" radius="lg" className="max-w-2xl w-full p-10 bg-white">
                <div className="space-y-6">
                    <div>
                        <label className="text-2xl font-semibold text-gray-900 block mb-2">
                            {module.title || "Desplegable"}
                            {module.isRequired && <span className="text-primary ml-1">*</span>}
                        </label>
                        {module.description && (
                            <p className="text-gray-600">{module.description}</p>
                        )}
                    </div>
                    <Select
                        labelPlacement="outside"
                        placeholder="Selecciona una opción"
                        radius="full"
                        variant="bordered"
                        size="lg"
                        classNames={{
                            trigger: "py-6 border-2 border-gray-300 focus:border-primary h-14",
                            value: "text-lg",
                            popoverContent: "p-0",
                        }}
                    >
                        {options.map((option) => (
                            <SelectItem key={option.value} textValue={option.label}>
                                <span className="text-base p-2 block">{option.label}</span>
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </Card>
        </div>
    );
}
