"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/react";
import { ChevronUp, ChevronDown, Plus, GripVertical, Trash2 } from "lucide-react";
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

interface FormPreviewProps {
    modules: Module[];
    selectedModuleId: string | null;
    onSelectModule: (id: string) => void;
    onAddModule: (type: string, position?: number) => void;
    onReorderModules?: (fromIndex: number, toIndex: number) => void;
    onDeleteModule?: (id: string) => void;
    isMobile?: boolean;
    onEditModule?: () => void;
}

const moduleTypeLabels: Record<string, string> = {
    WELCOME: "Bienvenida",
    QUOTE: "Cita",
    GOODBYE: "Despedida",
    TEXT: "Texto",
    EMAIL: "Email",
    NUMBER: "Número",
    PHONE: "Teléfono",
    URL: "URL",
    TEXTAREA: "Texto Largo",
    MULTIPLE_CHOICE: "Opción",
    CHECKBOXES: "Casillas",
    DROPDOWN: "Desplegable",
    DATE: "Fecha",
    FILE_UPLOAD: "Archivo",
};

export default function FormPreview({
    modules,
    selectedModuleId,
    onSelectModule,
    onAddModule,
    onReorderModules,
    onDeleteModule,
    isMobile,
    onEditModule,
}: FormPreviewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Sync currentIndex with selectedModuleId
    useEffect(() => {
        if (selectedModuleId) {
            const index = modules.findIndex((m) => m.id === selectedModuleId);
            if (index >= 0) {
                setCurrentIndex(index);
            }
        }
    }, [selectedModuleId, modules]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                navigatePrev();
            } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                navigateNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, modules.length]);

    const navigatePrev = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            onSelectModule(modules[newIndex].id);
        }
    };

    const navigateNext = () => {
        if (currentIndex < modules.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            onSelectModule(modules[newIndex].id);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const moduleType = e.dataTransfer.getData("moduleType");
        if (moduleType) {
            onAddModule(moduleType, currentIndex + 1);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    // Sidebar drag handlers
    const handleSidebarDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleSidebarDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index && onReorderModules) {
            onReorderModules(draggedIndex, index);
            setDraggedIndex(index);
        }
    };

    const handleSidebarDragEnd = () => {
        setDraggedIndex(null);
    };

    // Empty State
    if (modules.length === 0) {
        return (
            <div className="flex-1 flex">
                {/* Empty preview area */}
                <div
                    className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="text-center p-12 border-4 border-dashed border-gray-300 rounded-2xl mx-8">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <Plus className="text-gray-400" size={48} />
                        </div>
                        <p className="text-xl text-gray-700 font-semibold mb-2">
                            Arrastra un módulo aquí
                        </p>
                        <p className="text-gray-500">
                            Selecciona un tipo de pregunta de la barra lateral izquierda
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Safe access to module
    const currentModule = modules.find(m => m.id === selectedModuleId) || modules[currentIndex] || modules[0];

    // If no module exists (empty state handled above, but just in case of weird state)
    if (!currentModule) return null;

    return (
        <div className="flex-1 flex h-full">
            {/* Miniature Sidebar - Module List (hidden on mobile) */}
            {!isMobile && (
                <div className="w-20 bg-white border-r border-gray-200 flex flex-col py-4 overflow-y-auto">
                    <div className="px-2 space-y-2">
                        {modules.map((module, index) => (
                            <div
                                key={module.id || `module-${index}`}
                                draggable
                                onDragStart={() => handleSidebarDragStart(index)}
                                onDragOver={(e) => handleSidebarDragOver(e, index)}
                                onDragEnd={handleSidebarDragEnd}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    onSelectModule(module.id);
                                }}
                                className={`relative group cursor-pointer rounded-lg p-2 transition-all ${currentIndex === index
                                    ? "bg-gray-100 ring-2 ring-gray-900"
                                    : "bg-gray-50 hover:bg-gray-100"
                                    } ${draggedIndex === index ? "opacity-50" : ""}`}
                            >
                                {/* Module number */}
                                <div className="text-xs font-bold text-center mb-1 text-gray-700">
                                    {index + 1}
                                </div>

                                {/* Module type label */}
                                <div className="text-[10px] text-center text-gray-500 truncate">
                                    {moduleTypeLabels[module.type] || module.type}
                                </div>

                                {/* Delete button on hover */}
                                {onDeleteModule && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteModule(module.id);
                                        }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                )}

                                {/* Drag indicator */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-50 cursor-grab">
                                    <GripVertical size={12} className="text-gray-400" />
                                </div>
                            </div>
                        ))}

                        {/* Add button */}
                        <div
                            className="rounded-lg p-2 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-all"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <Plus size={16} className="mx-auto text-gray-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Preview Area - Full Screen Module */}
            <div
                ref={previewRef}
                className="flex-1 h-full relative bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {/* Current module - Full Screen */}
                <div
                    className={`h-full w-full flex items-center justify-center ${isMobile ? "p-4 cursor-pointer" : "p-8"}`}
                    onClick={() => isMobile && onEditModule?.()}
                >
                    <div className="w-full max-w-3xl pointer-events-none">
                        <ModuleRenderer module={currentModule} isPreview />
                    </div>
                </div>

                {/* Navigation Arrows */}
                {!isMobile && (
                    <div className={`absolute z-10 flex gap-2 right-6 top-1/2 -translate-y-1/2 flex-col`}>
                        <Button
                            isIconOnly
                            size={isMobile ? "md" : "lg"}
                            variant="flat"
                            radius="full"
                            isDisabled={currentIndex === 0}
                            onPress={navigatePrev}
                            className="bg-white/90 backdrop-blur shadow-lg border border-gray-100"
                        >
                            <ChevronUp size={isMobile ? 20 : 24} />
                        </Button>
                        <Button
                            isIconOnly
                            size={isMobile ? "md" : "lg"}
                            variant="flat"
                            radius="full"
                            isDisabled={currentIndex === modules.length - 1}
                            onPress={navigateNext}
                            className="bg-white/90 backdrop-blur shadow-lg border border-gray-100"
                        >
                            <ChevronDown size={isMobile ? 20 : 24} />
                        </Button>
                    </div>
                )}

                {/* Progress indicator */}
                <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-4 ${isMobile ? "bottom-20" : "bottom-6"
                    }`}>
                    {!isMobile && (
                        <span className="text-sm text-gray-500">
                            {currentIndex + 1} / {modules.length}
                        </span>
                    )}
                    <div className="flex gap-1">
                        {modules.map((module, i) => (
                            <div
                                key={module.id || `progress-${i}`}
                                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentIndex
                                    ? "bg-gray-900 w-6"
                                    : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                onClick={() => {
                                    setCurrentIndex(i);
                                    onSelectModule(modules[i].id);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Keyboard hint (Desktop only) */}
                {!isMobile && (
                    <div className="absolute bottom-6 right-6 text-xs text-gray-400">
                        ↑↓ para navegar
                    </div>
                )}
            </div>
        </div>
    );
}
