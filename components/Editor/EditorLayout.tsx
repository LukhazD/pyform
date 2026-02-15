"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import { Plus, Settings, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Toolbar from "@/components/Editor/Toolbar";
import PropertiesPanel from "@/components/Editor/PropertiesPanel";
import FormPreview from "@/components/Editor/FormPreview";
import MobileModuleNav from "@/components/Editor/MobileModuleNav";
import GeneralSettingsPanel from "@/components/Editor/GeneralSettingsPanel";

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

interface EditorLayoutProps {
    modules: Module[];
    selectedModuleId: string | null;
    onSelectModule: (id: string | null) => void;
    onUpdateModule: (id: string, updates: Partial<Module>) => void;
    onDeleteModule: (id: string) => void;
    onAddModule: (type: string, position?: number) => void;
    onReorderModules: (fromIndex: number, toIndex: number) => void;
    onModulesChange?: (modules: Module[]) => void;
    onDuplicateModule: (id: string) => void;
    formStyling?: FormStyling;
    onUpdateFormStyling?: (updates: Partial<FormStyling>) => void;
    formMetadata?: any;
    onUpdateForm?: (updates: any) => void;
}

type MobilePanel = "preview" | "toolbar" | "properties" | "settings";

export default function EditorLayout({
    modules,
    selectedModuleId,
    onSelectModule,
    onUpdateModule,
    onDeleteModule,
    onAddModule,
    onReorderModules,
    onDuplicateModule,
    onModulesChange,
    formStyling,
    onUpdateFormStyling,
    formMetadata,
    onUpdateForm,
}: EditorLayoutProps) {
    const selectedModule = modules.find((m) => m.id === selectedModuleId);
    const [isMobile, setIsMobile] = useState(false);
    const [activePanel, setActivePanel] = useState<MobilePanel>("preview");
    const [showingAddCard, setShowingAddCard] = useState(false);

    // Detect mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Desktop Layout
    if (!isMobile) {
        return (
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Toolbar */}
                <Toolbar
                    onAddModule={onAddModule}
                    onOpenSettings={() => onSelectModule(null)}
                />

                {/* Center - Form Preview (WYSIWYG) */}
                <FormPreview
                    modules={modules}
                    selectedModuleId={selectedModuleId}
                    onSelectModule={onSelectModule}
                    onAddModule={onAddModule}
                    onReorderModules={onReorderModules}
                    onDeleteModule={onDeleteModule}
                    styling={formStyling}
                    formSettings={formMetadata}
                />

                {/* Right Sidebar - Properties Panel */}
                <PropertiesPanel
                    selectedModule={selectedModule}
                    onUpdateModule={onUpdateModule}
                    onDeleteModule={onDeleteModule}
                    onDuplicateModule={onDuplicateModule}
                    styling={formStyling}
                    onUpdateStyling={onUpdateFormStyling}
                    formMetadata={formMetadata}
                    onUpdateForm={onUpdateForm}
                />
            </div>
        );
    }

    // Mobile Layout
    return (
        <div className="flex flex-col w-full flex-1 min-h-0 overflow-hidden">
            <div className="flex justify-between flex-col h-full overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 relative min-h-0 overflow-hidden">
                    {/* Preview is always rendered but may be hidden */}
                    <div className={`absolute inset-0 ${activePanel === "preview" ? "z-10 h-full" : "z-0 h-0 overflow-hidden"}`}>
                        <FormPreview
                            modules={modules}
                            selectedModuleId={selectedModuleId}
                            onSelectModule={(id) => {
                                onSelectModule(id);
                                setShowingAddCard(false);
                            }}
                            onAddModule={onAddModule}
                            onReorderModules={onReorderModules}
                            onDeleteModule={onDeleteModule}
                            isMobile
                            onEditModule={() => setActivePanel("properties")}
                            onOpenToolbar={() => {
                                setShowingAddCard(false);
                                setActivePanel("toolbar");
                            }}
                            onShowAddCardChange={setShowingAddCard}
                            styling={formStyling}
                            formSettings={formMetadata}
                        />
                    </div>

                    {/* Toolbar Sheet */}
                    {activePanel === "toolbar" && (
                        <div className="absolute inset-0 z-20 bg-white animate-in slide-in-from-bottom duration-200">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900">Añadir Módulo</h2>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    radius="full"
                                    onPress={() => setActivePanel("preview")}
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                            <div className="overflow-y-auto h-[calc(100%-60px)] pb-24">
                                <Toolbar
                                    isMobile
                                    onAddModule={(type, position) => {
                                        onAddModule(type, position);
                                        setShowingAddCard(false);
                                        setActivePanel("preview");
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Properties Sheet */}
                    {activePanel === "properties" && (
                        <div className="absolute inset-0 z-20 bg-white animate-in slide-in-from-bottom duration-200 flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const idx = modules.findIndex(m => m.id === selectedModuleId);
                                            if (idx > 0) onSelectModule(modules[idx - 1].id);
                                        }}
                                        disabled={modules.findIndex(m => m.id === selectedModuleId) <= 0}
                                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <h2 className="font-semibold text-gray-900">
                                        {(() => {
                                            const idx = modules.findIndex(m => m.id === selectedModuleId);
                                            return idx >= 0 ? `${idx + 1} / ${modules.length}` : "Propiedades";
                                        })()}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            const idx = modules.findIndex(m => m.id === selectedModuleId);
                                            if (idx < modules.length - 1) onSelectModule(modules[idx + 1].id);
                                        }}
                                        disabled={modules.findIndex(m => m.id === selectedModuleId) >= modules.length - 1}
                                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    radius="full"
                                    onPress={() => setActivePanel("preview")}
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                            <motion.div
                                className="flex-1 overflow-y-auto pb-24"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.15}
                                onDragEnd={(_, info: PanInfo) => {
                                    const idx = modules.findIndex(m => m.id === selectedModuleId);
                                    if (info.offset.x < -50 || info.velocity.x < -300) {
                                        if (idx < modules.length - 1) onSelectModule(modules[idx + 1].id);
                                    } else if (info.offset.x > 50 || info.velocity.x > 300) {
                                        if (idx > 0) onSelectModule(modules[idx - 1].id);
                                    }
                                }}
                                style={{ touchAction: "pan-y" }}
                            >
                                <PropertiesPanel
                                    selectedModule={selectedModule}
                                    onUpdateModule={onUpdateModule}
                                    onDeleteModule={onDeleteModule}
                                    onDuplicateModule={onDuplicateModule}
                                    onAddModule={() => setActivePanel("toolbar")}
                                    isMobile
                                />
                            </motion.div>
                        </div>
                    )}

                    {/* Settings Sheet */}
                    {activePanel === "settings" && (
                        <div className="absolute inset-0 z-20 bg-white animate-in slide-in-from-bottom duration-200">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900">Configuración General</h2>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    radius="full"
                                    onPress={() => setActivePanel("preview")}
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                            <div className="overflow-y-auto h-[calc(100%-60px)] pb-24">
                                <GeneralSettingsPanel
                                    styling={formStyling || {}}
                                    onUpdateStyling={onUpdateFormStyling || (() => { })}
                                    formMetadata={formMetadata}
                                    onUpdateForm={onUpdateForm || (() => { })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Bar */}
                <MobileModuleNav
                    modules={modules}
                    selectedModuleId={selectedModuleId}
                    showingAddCard={showingAddCard}
                    onSelectModule={(id) => {
                        onSelectModule(id);
                        setShowingAddCard(false);
                        if (activePanel !== "preview") setActivePanel("preview");
                    }}
                    onAddModule={() => {
                        setShowingAddCard(false);
                        setActivePanel("toolbar");
                    }}
                    onOpenSettings={() => setActivePanel("settings")}
                    onEditModule={() => {
                        if (selectedModuleId) setActivePanel("properties");
                    }}
                />
            </div>
        </div>
    );
}
