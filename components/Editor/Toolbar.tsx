/* eslint-disable no-unused-vars */
"use client";

import React from "react";
import ModuleButton from "./ModuleButton";
import {
    Home,
    Quote,
    CheckCircle,
    Type,
    Mail,
    Hash,
    Phone,
    Link,
    AlignLeft,
    Circle,
    CheckSquare,
    ChevronDown,
    Calendar,
    Upload,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface ToolbarProps {
    onAddModule: (type: string, position?: number) => void;
    onOpenSettings?: () => void;
    isMobile?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

// Module icon definitions (labels resolved via i18n inside component)
const informationalModuleDefs = [
    { type: "WELCOME", labelKey: "welcome" as const, icon: Home },
    { type: "QUOTE", labelKey: "quote" as const, icon: Quote },
    { type: "GOODBYE", labelKey: "goodbye" as const, icon: CheckCircle },
];

const questionModuleDefs = [
    { type: "TEXT", labelKey: "shortText" as const, icon: Type },
    { type: "EMAIL", labelKey: "email" as const, icon: Mail },
    { type: "NUMBER", labelKey: "number" as const, icon: Hash },
    { type: "PHONE", labelKey: "phone" as const, icon: Phone },
    { type: "URL", labelKey: "url" as const, icon: Link },
    { type: "TEXTAREA", labelKey: "longText" as const, icon: AlignLeft },
    { type: "MULTIPLE_CHOICE", labelKey: "multipleChoice" as const, icon: Circle },
    { type: "CHECKBOXES", labelKey: "checkboxes" as const, icon: CheckSquare },
    { type: "DROPDOWN", labelKey: "dropdown" as const, icon: ChevronDown },
    { type: "DATE", labelKey: "date" as const, icon: Calendar },
    { type: "FILE_UPLOAD", labelKey: "fileUpload" as const, icon: Upload },
];

export default function Toolbar({ onAddModule, onOpenSettings, isMobile, isCollapsed = false, onToggleCollapse }: ToolbarProps) {
    const t = useTranslations("editor.toolbar");

    const informationalModules = informationalModuleDefs.map(m => ({ ...m, label: t(m.labelKey) }));
    const questionModules = questionModuleDefs.map(m => ({ ...m, label: t(m.labelKey) }));
    return (
        <div className={`bg-white transition-all duration-300 ${isMobile ? 'w-full' : isCollapsed ? 'w-20' : 'w-64 border-r border-gray-200'} p-4 overflow-y-auto flex-shrink-0 flex flex-col`}>
            {/* Collapse Toggle */}
            {!isMobile && onToggleCollapse && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={onToggleCollapse}
                        className={`p-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md transition-colors ${isCollapsed ? "w-full" : ""}`}
                        title={isCollapsed ? t("expandTools") : t("collapseTools")}
                    >
                        {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                </div>
            )}
            {/* General Settings Button */}
            {!isMobile && (
                <div className="mb-6">
                    <button
                        onClick={onOpenSettings}
                        title={isCollapsed ? t("designSettings") : undefined}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all text-left border border-transparent hover:border-gray-200 ${isCollapsed ? "justify-center" : ""}`}
                    >
                        <div className="flex items-center justify-center text-gray-600 flex-shrink-0">
                            <Settings size={20} />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium text-gray-700 truncate">{t("designSettings")}</span>}
                    </button>
                </div>
            )}

            {/* Informational Modules */}
            <div className={`mb-6 ${isCollapsed ? 'mb-4' : ''}`}>
                {!isCollapsed && (
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                        {t("informationalModules")}
                    </h3>
                )}
                <div className={isMobile ? "grid grid-cols-2 gap-2" : "space-y-2"}>
                    {informationalModules.map((module) => (
                        <ModuleButton
                            key={module.type}
                            type={module.type}
                            label={module.label}
                            icon={<module.icon size={18} />}
                            onClick={() => onAddModule(module.type)}
                            compact={isMobile}
                            iconOnly={isCollapsed}
                        />
                    ))}
                </div>
            </div>

            {/* Question Modules */}
            <div>
                {!isCollapsed && (
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                        {t("questionTypes")}
                    </h3>
                )}
                <div className={isMobile ? "grid grid-cols-2 gap-2" : "space-y-2"}>
                    {questionModules.map((module) => (
                        <ModuleButton
                            key={module.type}
                            type={module.type}
                            label={module.label}
                            icon={<module.icon size={18} />}
                            onClick={() => onAddModule(module.type)}
                            compact={isMobile}
                            iconOnly={isCollapsed}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
