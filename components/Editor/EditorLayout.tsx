"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Plus, Settings, Eye, X } from "lucide-react";
import Toolbar from "@/components/Editor/Toolbar";
import PropertiesPanel from "@/components/Editor/PropertiesPanel";
import FormPreview from "@/components/Editor/FormPreview";
import MobileModuleNav from "@/components/Editor/MobileModuleNav";
import GeneralSettingsPanel from "@/components/Editor/GeneralSettingsPanel";

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
    formStyling?: any;
    onUpdateFormStyling?: (updates: any) => void;
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

    // Detect mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
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
                <Toolbar onAddModule={onAddModule} />

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
                />
            </div>
        );
    }

    // Mobile Layout
    return (
        <div className="h-full flex justify-between flex-col">
            {/* Main Content Area */}
            <div className="h-full relative">
                {/* Preview is always rendered but may be hidden */}
                <div className={`absolute inset-0 ${activePanel === "preview" ? "z-10 h-full" : "z-0 h-0 overflow-hidden"}`}>
                    <FormPreview
                        modules={modules}
                        selectedModuleId={selectedModuleId}
                        onSelectModule={onSelectModule}
                        onAddModule={onAddModule}
                        onReorderModules={onReorderModules}
                        onDeleteModule={onDeleteModule}
                        isMobile
                        onEditModule={() => setActivePanel("properties")}
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
                                onAddModule={(type, position) => {
                                    onAddModule(type, position);
                                    setActivePanel("preview");
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Properties Sheet */}
                {activePanel === "properties" && (
                    <div className="absolute inset-0 z-20 bg-white animate-in slide-in-from-bottom duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900">Propiedades</h2>
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
                            <PropertiesPanel
                                selectedModule={selectedModule}
                                onUpdateModule={onUpdateModule}
                                onDeleteModule={onDeleteModule}
                                onDuplicateModule={onDuplicateModule}
                                isMobile
                            />
                        </div>
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
            {/* Bottom Navigation Strip */}
            <MobileModuleNav
                modules={modules}
                selectedModuleId={selectedModuleId}
                onSelectModule={(id) => {
                    if (id === selectedModuleId) {
                        onSelectModule(null); // Deselect if already selected
                        if (activePanel === "properties") setActivePanel("preview");
                    } else {
                        onSelectModule(id);
                        if (activePanel === "toolbar") setActivePanel("preview");
                    }
                }}
                onAddModule={() => setActivePanel("toolbar")}
                onModulesChange={onModulesChange}
                onReorderModules={onReorderModules}
                onOpenSettings={() => setActivePanel("settings")}
            />
        </div>
    );
}
