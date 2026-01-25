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
} from "lucide-react";

interface ToolbarProps {
    onAddModule: (type: string, position?: number) => void;
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

export default function Toolbar({ onAddModule }: ToolbarProps) {
    return (
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto flex-shrink-0">
            {/* Informational Modules */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Módulos Informativos
                </h3>
                <div className="space-y-2">
                    {informationalModules.map((module) => (
                        <ModuleButton
                            key={module.type}
                            type={module.type}
                            label={module.label}
                            icon={<module.icon size={18} />}
                            onClick={() => onAddModule(module.type)}
                        />
                    ))}
                </div>
            </div>

            {/* Question Modules */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Tipos de Pregunta
                </h3>
                <div className="space-y-2">
                    {questionModules.map((module) => (
                        <ModuleButton
                            key={module.type}
                            type={module.type}
                            label={module.label}
                            icon={<module.icon size={18} />}
                            onClick={() => onAddModule(module.type)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
