"use client";

import React from "react";
import { Settings, Pencil, Plus } from "lucide-react";

interface Module {
    id: string;
    type: string;
    order?: number;
}

interface MobileModuleNavProps {
    modules: Module[];
    selectedModuleId: string | null;
    showingAddCard?: boolean;
    onSelectModule: (id: string) => void;
    onAddModule: () => void;
    onOpenSettings?: () => void;
    onEditModule?: () => void;
}

export default function MobileModuleNav({
    modules,
    selectedModuleId,
    showingAddCard,
    onSelectModule,
    onAddModule,
    onOpenSettings,
    onEditModule,
}: MobileModuleNavProps) {
    const currentIndex = modules.findIndex((m) => m.id === selectedModuleId);

    return (
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-100 flex-shrink-0 z-30">
            <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
                {/* Settings Button */}
                <button
                    onClick={onOpenSettings}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="Configuración"
                >
                    <Settings size={20} />
                </button>

                {/* Center: Position dots */}
                <div className="flex-1 flex items-center justify-center gap-1.5 px-4 overflow-hidden">
                    {modules.map((module, i) => (
                        <button
                            key={module.id || `dot-${i}`}
                            onClick={() => onSelectModule(module.id)}
                            className={`rounded-full transition-all duration-200 flex-shrink-0 ${!showingAddCard && i === currentIndex
                                ? "w-6 h-2.5 bg-gray-900"
                                : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                                }`}
                            aria-label={`Módulo ${i + 1}`}
                        />
                    ))}
                    {/* Add dot — shows active when on ghost card */}
                    <button
                        onClick={onAddModule}
                        className={`rounded-full transition-all duration-200 flex-shrink-0 flex items-center justify-center ${showingAddCard
                            ? "w-6 h-6 bg-gray-900 text-white"
                            : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"
                            }`}
                        aria-label="Añadir módulo"
                    >
                        {showingAddCard && <Plus size={14} />}
                    </button>
                </div>

                {/* Edit Button */}
                <button
                    onClick={onEditModule}
                    disabled={showingAddCard || currentIndex === -1}
                    className={`flex items-center gap-1.5 px-4 h-10 rounded-full transition-all ${showingAddCard || currentIndex === -1
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-900 text-white active:scale-95 shadow-sm"
                        }`}
                    aria-label="Editar módulo"
                >
                    <Pencil size={16} />
                    <span className="text-sm font-medium">Editar</span>
                </button>
            </div>
        </div>
    );
}
