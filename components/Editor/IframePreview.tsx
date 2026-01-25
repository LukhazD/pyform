/* eslint-disable no-unused-vars */
"use client";

import React, { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
import ModuleRenderer from "../Modules/ModuleRenderer";

interface Module {
    id: string;
    type: string;
    order?: number;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
    options?: Array<{ id: string; label: string; value: string; order: number }>;
    buttonText?: string;
    message?: string;
    showConfetti?: boolean;
}

interface IframePreviewProps {
    modules: Module[];
    selectedModuleId: string | null;
    onSelectModule: (id: string) => void;
    onAddModule: (type: string, position?: number) => void;
    onReorderModules?: (fromIndex: number, toIndex: number) => void;
}

export default function IframePreview({
    modules,
    selectedModuleId,
    onSelectModule,
    onAddModule,
    onReorderModules,
}: IframePreviewProps) {
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggingModuleId, setDraggingModuleId] = useState<string | null>(null);

    const handleDrop = (e: React.DragEvent, position: number) => {
        e.preventDefault();
        setDragOverIndex(null);

        // Check if dropping a new module from toolbar
        const moduleType = e.dataTransfer.getData("moduleType");
        if (moduleType) {
            onAddModule(moduleType, position);
            return;
        }

        // Check if reordering existing module
        const reorderingIndex = e.dataTransfer.getData("reorderIndex");
        if (reorderingIndex && onReorderModules) {
            const fromIndex = parseInt(reorderingIndex, 10);
            if (fromIndex !== position && fromIndex !== position - 1) {
                onReorderModules(fromIndex, position > fromIndex ? position - 1 : position);
            }
        }

        setDraggingModuleId(null);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleModuleDragStart = (e: React.DragEvent, moduleId: string, index: number) => {
        e.dataTransfer.setData("reorderIndex", index.toString());
        e.dataTransfer.effectAllowed = "move";
        setDraggingModuleId(moduleId);
    };

    // Empty State
    if (modules.length === 0) {
        return (
            <div className="flex-1 bg-gray-100 overflow-y-auto">
                <div
                    className="h-full flex items-center justify-center border-4 border-dashed border-gray-300 m-6 rounded-xl"
                    onDrop={(e) => handleDrop(e, 0)}
                    onDragOver={(e) => handleDragOver(e, 0)}
                    onDragLeave={handleDragLeave}
                >
                    <div className="text-center p-12">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <Plus className="text-gray-400 group-hover:text-gray-900 transition-colors" size={48} />
                        </div>
                        <p className="text-xl text-gray-700 font-semibold mb-2">Arrastra módulos aquí</p>
                        <p className="text-gray-500">
                            Selecciona un tipo de pregunta de la barra lateral izquierda
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8 px-6">
                {modules.map((module, index) => (
                    <div key={module.id}>
                        {/* Drop zone BEFORE module - always visible when dragging */}
                        <div
                            className={`transition-all rounded-xl mb-3 ${dragOverIndex === index
                                ? "h-20 bg-gray-50 border-3 border-dashed border-gray-900 flex items-center justify-center"
                                : "h-4 hover:h-16 hover:bg-gray-50 hover:border-2 hover:border-dashed hover:border-gray-400"
                                }`}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                        >
                            {dragOverIndex === index && (
                                <span className="text-gray-600 font-medium text-sm">
                                    Soltar aquí
                                </span>
                            )}
                        </div>

                        {/* Module with drag handle */}
                        <div
                            className={`relative group rounded-xl transition-all ${draggingModuleId === module.id ? "opacity-50" : ""
                                } ${selectedModuleId === module.id
                                    ? "ring-2 ring-gray-900 ring-offset-4"
                                    : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                                }`}
                        >
                            {/* Drag handle */}
                            <div
                                draggable
                                onDragStart={(e) => handleModuleDragStart(e, module.id, index)}
                                onDragEnd={() => setDraggingModuleId(null)}
                                className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-gray-200 transition-opacity"
                            >
                                <GripVertical className="text-gray-400" size={20} />
                            </div>

                            {/* Module content */}
                            <div
                                className="cursor-pointer"
                                onClick={() => onSelectModule(module.id)}
                            >
                                <ModuleRenderer module={module} isPreview />
                            </div>
                        </div>

                        {/* Drop zone AFTER last module */}
                        {index === modules.length - 1 && (
                            <div
                                className={`transition-all rounded-xl mt-3 ${dragOverIndex === index + 1
                                    ? "h-20 bg-gray-50 border-3 border-dashed border-gray-900 flex items-center justify-center"
                                    : "h-4 hover:h-16 hover:bg-gray-50 hover:border-2 hover:border-dashed hover:border-gray-400"
                                    }`}
                                onDrop={(e) => handleDrop(e, index + 1)}
                                onDragOver={(e) => handleDragOver(e, index + 1)}
                                onDragLeave={handleDragLeave}
                            >
                                {dragOverIndex === index + 1 && (
                                    <span className="text-gray-600 font-medium text-sm">
                                        Soltar aquí
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
