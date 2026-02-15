"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import { ChevronUp, ChevronDown, Plus, GripVertical, Trash2 } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import ModuleRenderer from "../Modules/ModuleRenderer";
import { FormStyling } from "@/types/FormStyling";

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
    onOpenToolbar?: () => void;
    onShowAddCardChange?: (showing: boolean) => void;
    styling?: FormStyling;
    formSettings?: any;
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

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 300;

export default function FormPreview({
    modules,
    selectedModuleId,
    onSelectModule,
    onAddModule,
    onReorderModules,
    onDeleteModule,
    isMobile,
    onEditModule,
    onOpenToolbar,
    onShowAddCardChange,
    styling,
}: FormPreviewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 = left, 1 = right
    const [showAddCard, setShowAddCard] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const lastTapTime = useRef(0);
    const [showHint, setShowHint] = useState(true);

    // Notify parent when showAddCard changes
    useEffect(() => {
        onShowAddCardChange?.(showAddCard);
    }, [showAddCard]);

    // Sync currentIndex with selectedModuleId
    useEffect(() => {
        if (selectedModuleId) {
            const index = modules.findIndex((m) => m.id === selectedModuleId);
            if (index >= 0) {
                setCurrentIndex(index);
                setShowAddCard(false);
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
    }, [currentIndex, modules.length, showAddCard]);

    const navigatePrev = useCallback(() => {
        if (showAddCard) {
            // Go back from add card to last module
            setShowAddCard(false);
            setDirection(1);
            const lastIndex = modules.length - 1;
            setCurrentIndex(lastIndex);
            if (modules[lastIndex]) onSelectModule(modules[lastIndex].id);
            return;
        }
        if (currentIndex > 0) {
            setDirection(1);
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            onSelectModule(modules[newIndex].id);
        }
    }, [currentIndex, modules, showAddCard, onSelectModule]);

    const navigateNext = useCallback(() => {
        if (showAddCard) return; // Already on add card
        if (currentIndex < modules.length - 1) {
            setDirection(-1);
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            onSelectModule(modules[newIndex].id);
        } else {
            // Past last module → show add card
            setDirection(-1);
            setShowAddCard(true);
        }
    }, [currentIndex, modules, showAddCard, onSelectModule]);

    // Mobile swipe handler
    const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info;
        const swipedLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY;
        const swipedRight = offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY;

        if (swipedLeft) {
            navigateNext();
        } else if (swipedRight) {
            navigatePrev();
        }
    }, [navigateNext, navigatePrev]);

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

    // Animation variants for slide transitions
    const slideVariants = {
        enter: (dir: number) => ({
            x: dir < 0 ? "100%" : "-100%",
            opacity: 0.5,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir < 0 ? "-100%" : "100%",
            opacity: 0.5,
        }),
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
                            {isMobile ? "Pulsa + para empezar" : "Arrastra un módulo aquí"}
                        </p>
                        <p className="text-gray-500">
                            {isMobile
                                ? "Añade tu primer módulo al formulario"
                                : "Selecciona un tipo de pregunta de la barra lateral izquierda"
                            }
                        </p>
                        {isMobile && (
                            <button
                                onClick={onOpenToolbar}
                                className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                            >
                                <Plus size={18} className="inline mr-2 -mt-0.5" />
                                Añadir módulo
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Safe access to module
    const currentModule = modules.find(m => m.id === selectedModuleId) || modules[currentIndex] || modules[0];

    // If no module exists
    if (!currentModule && !showAddCard) return null;

    // Unique key for AnimatePresence
    const contentKey = showAddCard ? "add-card" : (currentModule?.id || `idx-${currentIndex}`);

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

            {/* Main Preview Area */}
            <div
                ref={previewRef}
                className="flex-1 h-full relative bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onSelectModule("");
                    }
                }}
                style={{
                    // @ts-ignore
                    "--color-primary": styling?.primaryColor || "#3b82f6",
                    fontFamily: styling?.fontFamily ? `"${styling.fontFamily}", sans-serif` : "Inter, sans-serif",
                } as React.CSSProperties}
            >
                {/* Mobile: Swipeable content */}
                {isMobile ? (
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.div
                            key={contentKey}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 350, damping: 35 },
                                opacity: { duration: 0.15 },
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.3}
                            onDragEnd={handleDragEnd}
                            className="h-full w-full absolute inset-0"
                            style={{ touchAction: "pan-y" }}
                        >
                            {showAddCard ? (
                                /* Ghost "Add Module" card */
                                <div className="h-full w-full flex items-center justify-center px-6 pb-4 pt-4">
                                    <div className="w-full max-w-sm text-center">
                                        {/* Animated icon */}
                                        <div className="relative mx-auto w-20 h-20 mb-6">
                                            <div className="absolute inset-0 rounded-full bg-gray-900/10 animate-ping" style={{ animationDuration: "2s" }} />
                                            <button
                                                onClick={onOpenToolbar}
                                                className="relative w-20 h-20 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                                            >
                                                <Plus size={32} strokeWidth={2.5} />
                                            </button>
                                        </div>

                                        {/* Text */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            Añadir nuevo módulo
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                            Agrega preguntas, textos o elementos<br />a tu formulario
                                        </p>

                                        {/* Quick hint chips */}
                                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                                            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">📝 Texto</span>
                                            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">🔘 Opción múltiple</span>
                                            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">📅 Fecha</span>
                                            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">📎 Archivo</span>
                                        </div>

                                        {/* CTA button */}
                                        <button
                                            onClick={onOpenToolbar}
                                            className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold text-sm hover:bg-gray-800 active:scale-95 transition-all shadow-md"
                                        >
                                            Elegir tipo de módulo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Module content */
                                <div
                                    className="h-full w-full flex flex-col items-center justify-center px-4 pb-4 pt-4"
                                    onClick={() => {
                                        const now = Date.now();
                                        if (now - lastTapTime.current < 300) {
                                            // Double-tap detected
                                            onEditModule?.();
                                            lastTapTime.current = 0;
                                        } else {
                                            lastTapTime.current = now;
                                        }
                                    }}
                                >
                                    <div className="w-full max-w-3xl pointer-events-none">
                                        <ModuleRenderer
                                            module={currentModule}
                                            isPreview
                                            primaryColor={styling?.primaryColor}
                                            radius={styling?.heroUIRadius === "full" ? "lg" : styling?.heroUIRadius}
                                            shadow={styling?.heroUIShadow}
                                        />
                                    </div>
                                    {/* Double-tap hint */}
                                    <p className={`mt-4 text-xs text-gray-400 transition-opacity duration-700 ${showHint ? 'opacity-100' : 'opacity-0'}`}>
                                        Toca dos veces para editar
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    /* Desktop: Static content (no swipe) */
                    <div
                        className="h-full w-full flex items-center justify-center p-8"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <div className="w-full max-w-3xl pointer-events-none">
                            <ModuleRenderer
                                module={currentModule}
                                isPreview
                                primaryColor={styling?.primaryColor}
                                radius={styling?.heroUIRadius === "full" ? "lg" : styling?.heroUIRadius}
                                shadow={styling?.heroUIShadow}
                            />
                        </div>
                    </div>
                )}

                {/* Navigation Arrows (Desktop only) */}
                {!isMobile && (
                    <div className={`absolute z-10 flex gap-2 right-6 top-1/2 -translate-y-1/2 flex-col`}>
                        <Button
                            isIconOnly
                            size="lg"
                            variant="flat"
                            radius="full"
                            isDisabled={currentIndex === 0}
                            onPress={navigatePrev}
                            className="bg-white/90 backdrop-blur shadow-lg border border-gray-100"
                        >
                            <ChevronUp size={24} />
                        </Button>
                        <Button
                            isIconOnly
                            size="lg"
                            variant="flat"
                            radius="full"
                            isDisabled={currentIndex === modules.length - 1}
                            onPress={navigateNext}
                            className="bg-white/90 backdrop-blur shadow-lg border border-gray-100"
                        >
                            <ChevronDown size={24} />
                        </Button>
                    </div>
                )}

                {/* Progress indicator (Desktop only — mobile dots move to bottom bar) */}
                {!isMobile && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            {currentIndex + 1} / {modules.length}
                        </span>
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
                )}

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
