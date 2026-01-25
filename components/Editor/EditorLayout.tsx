"use client";

import React from "react";
import Toolbar from "@/components/Editor/Toolbar";
import PropertiesPanel from "@/components/Editor/PropertiesPanel";
import FormPreview from "@/components/Editor/FormPreview";

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
    onSelectModule: (id: string) => void;
    onUpdateModule: (id: string, updates: Partial<Module>) => void;
    onDeleteModule: (id: string) => void;
    onAddModule: (type: string, position?: number) => void;
    onReorderModules: (fromIndex: number, toIndex: number) => void;
    onDuplicateModule: (id: string) => void;
}

export default function EditorLayout({
    modules,
    selectedModuleId,
    onSelectModule,
    onUpdateModule,
    onDeleteModule,
    onAddModule,
    onReorderModules,
    onDuplicateModule,
}: EditorLayoutProps) {
    const selectedModule = modules.find((m) => m.id === selectedModuleId);

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
