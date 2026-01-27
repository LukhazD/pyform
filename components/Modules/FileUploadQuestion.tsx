"use client";

import React from "react";
import { Card } from "@heroui/react";
import { Upload } from "lucide-react";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    isRequired?: boolean;
}

interface FileUploadQuestionProps {
    module: Module;
}

export default function FileUploadQuestion({ module }: FileUploadQuestionProps) {
    return (
        <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center p-4 md:p-8">
            <Card shadow="sm" radius="lg" className="max-w-2xl w-full p-6 md:p-10 bg-white">
                <div className="space-y-3">
                    <div>
                        <label className="text-xl md:text-2xl font-semibold text-gray-900 block mb-2">
                            {module.title || "Subir archivo"}
                            {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {module.description && (
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-700 font-medium mb-1">
                            Arrastra archivos aquí
                        </p>
                        <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Máximo 10MB • PDF, DOC, JPG, PNG
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
