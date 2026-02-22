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

interface ToolbarProps {
    onAddModule: (type: string, position?: number) => void;
    onOpenSettings?: () => void;
    isMobile?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

// Module definitions
const informationalModules = [
    { type: "WELCOME", label: "Bienvenida", icon: Home },
    { type: "QUOTE", label: "Cita", icon: Quote },
    { type: "GOODBYE", label: "Despedida", icon: CheckCircle },
];

const questionModules = [
    { type: "TEXT", label: "Texto Corto", icon: Type },
    { type: "EMAIL", label: "Email", icon: Mail },
    { type: "NUMBER", label: "Número", icon: Hash },
    { type: "PHONE", label: "Teléfono", icon: Phone },
    { type: "URL", label: "URL", icon: Link },
    { type: "TEXTAREA", label: "Texto Largo", icon: AlignLeft },
    { type: "MULTIPLE_CHOICE", label: "Opción Múltiple", icon: Circle },
    { type: "CHECKBOXES", label: "Casillas", icon: CheckSquare },
    { type: "DROPDOWN", label: "Desplegable", icon: ChevronDown },
    { type: "DATE", label: "Fecha", icon: Calendar },
    { type: "FILE_UPLOAD", label: "Archivo", icon: Upload },
];

export default function Toolbar({ onAddModule, onOpenSettings, isMobile, isCollapsed = false, onToggleCollapse }: ToolbarProps) {
    return (
        <div className={`bg-white transition-all duration-300 ${isMobile ? 'w-full' : isCollapsed ? 'w-20' : 'w-64 border-r border-gray-200'} p-4 overflow-y-auto flex-shrink-0 flex flex-col`}>
            {/* Collapse Toggle */}
            {!isMobile && onToggleCollapse && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={onToggleCollapse}
                        className={`p-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md transition-colors ${isCollapsed ? "w-full" : ""}`}
                        title={isCollapsed ? "Expandir herramientas" : "Colapsar herramientas"}
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
                        title={isCollapsed ? "Diseño y Configuración" : undefined}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all text-left border border-transparent hover:border-gray-200 ${isCollapsed ? "justify-center" : ""}`}
                    >
                        <div className="flex items-center justify-center text-gray-600 flex-shrink-0">
                            <Settings size={20} />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium text-gray-700 truncate">Diseño y Configuración</span>}
                    </button>
                </div>
            )}

            {/* Informational Modules */}
            <div className={`mb-6 ${isCollapsed ? 'mb-4' : ''}`}>
                {!isCollapsed && (
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Módulos Informativos
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
                        Tipos de pregunta
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
