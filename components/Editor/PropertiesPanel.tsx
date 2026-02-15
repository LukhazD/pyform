/* eslint-disable no-unused-vars */
"use client";

import React from "react";
import { Button, Input, Textarea, Switch, Divider } from "@heroui/react";
import { Trash2, Copy, MousePointer, Plus, X, GripVertical, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import GeneralSettingsPanel from "./GeneralSettingsPanel";

interface Option {
    id: string;
    label: string;
    value: string;
    order: number;
}

interface Module {
    id: string;
    type: string;
    order?: number;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
    options?: Option[];
    buttonText?: string;
    message?: string;
    showConfetti?: boolean;
}

interface PropertiesPanelProps {
    selectedModule: Module | undefined;
    onUpdateModule: (id: string, updates: Partial<Module>) => void;
    onDeleteModule: (id: string) => void;
    onDuplicateModule?: (id: string) => void;
    onAddModule?: () => void;
    isMobile?: boolean;
    styling?: any;
    onUpdateStyling?: (updates: any) => void;
    formMetadata?: any;
    onUpdateForm?: (updates: any) => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}

const moduleLabels: Record<string, string> = {
    WELCOME: "Bienvenida",
    QUOTE: "Cita",
    GOODBYE: "Despedida",
    TEXT: "Texto Corto",
    EMAIL: "Email",
    NUMBER: "Número",
    PHONE: "Teléfono",
    URL: "URL",
    TEXTAREA: "Texto Largo",
    MULTIPLE_CHOICE: "Opción Múltiple",
    CHECKBOXES: "Casillas",
    DROPDOWN: "Desplegable",
    DATE: "Fecha",
    FILE_UPLOAD: "Archivo",
};

export default function PropertiesPanel({
    selectedModule,
    onUpdateModule,
    onDeleteModule,
    onDuplicateModule,
    onAddModule,
    isMobile,
    styling,
    onUpdateStyling,
    formMetadata,
    onUpdateForm,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
}: PropertiesPanelProps) {
    if (!selectedModule) {
        return (
            <div className={`bg-white ${isMobile ? 'w-full' : 'w-80 border-l border-gray-200'} h-full overflow-hidden flex flex-col`}>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* @ts-ignore */}
                    <GeneralSettingsPanel
                        styling={styling}
                        onUpdateStyling={onUpdateStyling}
                        formMetadata={formMetadata}
                        onUpdateForm={onUpdateForm}
                    />
                </div>
            </div>
        );
    }

    const handleUpdate = (field: string, value: any) => {
        onUpdateModule(selectedModule.id, { [field]: value });
    };

    // Options management for MULTIPLE_CHOICE, CHECKBOXES, DROPDOWN
    const hasOptions = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"].includes(selectedModule.type);

    const options = selectedModule.options || [
        { id: "opt-1", label: "Opción 1", value: "option1", order: 0 },
        { id: "opt-2", label: "Opción 2", value: "option2", order: 1 },
    ];

    const handleAddOption = () => {
        const newOption: Option = {
            id: `opt-${Date.now()}`,
            label: `Opción ${options.length + 1}`,
            value: `option${options.length + 1}`,
            order: options.length,
        };
        handleUpdate("options", [...options, newOption]);
    };

    const handleUpdateOption = (optionId: string, field: string, value: string) => {
        const updatedOptions = options.map((opt) =>
            opt.id === optionId ? { ...opt, [field]: value } : opt
        );
        handleUpdate("options", updatedOptions);
    };

    const handleDeleteOption = (optionId: string) => {
        if (options.length <= 2) {
            return; // Minimum 2 options required
        }
        const updatedOptions = options
            .filter((opt) => opt.id !== optionId)
            .map((opt, index) => ({ ...opt, order: index }));
        handleUpdate("options", updatedOptions);
    };

    return (
        <div className={`bg-white ${isMobile ? 'w-full' : 'w-80 border-l border-gray-200'} p-6 overflow-y-auto flex-shrink-0`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                    {moduleLabels[selectedModule.type] || selectedModule.type}
                </h3>
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                    onPress={() => onDeleteModule(selectedModule.id)}
                >
                    <Trash2 size={18} className="text-red-500" />
                </Button>
            </div>

            {/* Common Properties */}
            <div className="space-y-4">
                {/* Title */}
                <Input
                    label="Título"
                    placeholder="Escribe el título"
                    radius="lg"
                    variant="bordered"
                    value={selectedModule.title || ""}
                    onChange={(e) => handleUpdate("title", e.target.value)}
                    classNames={{
                        inputWrapper: "border-gray-300 focus-within:border-primary",
                    }}
                />

                {/* Description */}
                <Textarea
                    label="Descripción (opcional)"
                    placeholder="Añade contexto adicional"
                    radius="lg"
                    variant="bordered"
                    minRows={2}
                    value={selectedModule.description || ""}
                    onChange={(e) => handleUpdate("description", e.target.value)}
                    classNames={{
                        inputWrapper: "border-gray-300 focus-within:border-primary",
                    }}
                />

                {/* Placeholder - for simple text inputs */}
                {!["WELCOME", "QUOTE", "GOODBYE", "MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "DATE", "FILE_UPLOAD"].includes(selectedModule.type) && (
                    <Input
                        label="Placeholder"
                        placeholder="Texto de ejemplo"
                        radius="lg"
                        variant="bordered"
                        value={selectedModule.placeholder || ""}
                        onChange={(e) => handleUpdate("placeholder", e.target.value)}
                        classNames={{
                            inputWrapper: "border-gray-300 focus-within:border-primary",
                        }}
                    />
                )}

                {/* OPTIONS EDITOR for MULTIPLE_CHOICE, CHECKBOXES, DROPDOWN */}
                {hasOptions && (
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                            Opciones
                        </label>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div key={option.id} className="flex items-center gap-2 group">
                                    <div className="text-gray-300 cursor-grab">
                                        <GripVertical size={16} />
                                    </div>
                                    <Input
                                        size="sm"
                                        radius="lg"
                                        variant="bordered"
                                        value={option.label}
                                        onChange={(e) => handleUpdateOption(option.id, "label", e.target.value)}
                                        onBlur={() => {
                                            // Auto-update value based on label if not manually set
                                            if (option.value === `option${index + 1}` || !option.value) {
                                                handleUpdateOption(option.id, "value", option.label.toLowerCase().replace(/\s+/g, "_"));
                                            }
                                        }}
                                        classNames={{
                                            inputWrapper: "border-gray-200 focus-within:border-primary",
                                        }}
                                        placeholder={`Opción ${index + 1}`}
                                    />
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        radius="full"
                                        onPress={() => handleDeleteOption(option.id)}
                                        isDisabled={options.length <= 2}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} className="text-gray-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            size="sm"
                            variant="bordered"
                            radius="full"
                            startContent={<Plus size={14} />}
                            onPress={handleAddOption}
                            className="w-full mt-2"
                        >
                            Añadir opción
                        </Button>
                    </div>
                )}

                {/* Button Text - for WELCOME */}
                {selectedModule.type === "WELCOME" && (
                    <Input
                        label="Texto del Botón"
                        placeholder="Comenzar"
                        radius="lg"
                        variant="bordered"
                        value={selectedModule.buttonText || "Comenzar"}
                        onChange={(e) => handleUpdate("buttonText", e.target.value)}
                        classNames={{
                            inputWrapper: "border-gray-300 focus-within:border-primary",
                        }}
                    />
                )}

                {/* Message - for GOODBYE */}
                {selectedModule.type === "GOODBYE" && (
                    <>
                        <Textarea
                            label="Mensaje"
                            placeholder="Mensaje de despedida"
                            radius="lg"
                            variant="bordered"
                            value={selectedModule.message || ""}
                            onChange={(e) => handleUpdate("message", e.target.value)}
                        />
                        <Switch
                            isSelected={selectedModule.showConfetti || false}
                            onValueChange={(value) => handleUpdate("showConfetti", value)}
                        >
                            <span className="text-sm">Mostrar confetti</span>
                        </Switch>
                    </>
                )}

                {/* Required toggle - for question types */}
                {!["WELCOME", "QUOTE", "GOODBYE"].includes(selectedModule.type) && (
                    <Switch
                        isSelected={selectedModule.isRequired || false}
                        onValueChange={(value) => handleUpdate("isRequired", value)}
                    >
                        <span className="text-sm">Campo obligatorio</span>
                    </Switch>
                )}
            </div>

            <Divider className="my-6" />

            {/* Actions */}
            <div className="space-y-3">
                {/* Move Up/Down — visible on mobile */}
                {isMobile && (onMoveUp || onMoveDown) && (
                    <div className="flex gap-2">
                        <Button
                            fullWidth
                            variant="bordered"
                            radius="full"
                            startContent={<ChevronLeft size={16} />}
                            onPress={onMoveUp}
                            isDisabled={!canMoveUp}
                            className="border-gray-300"
                        >
                            Mover a la izquierda
                        </Button>
                        <Button
                            fullWidth
                            variant="bordered"
                            radius="full"
                            endContent={<ChevronRight size={16} />}
                            onPress={onMoveDown}
                            isDisabled={!canMoveDown}
                            className="border-gray-300"
                        >
                            Mover a la derecha
                        </Button>
                    </div>
                )}
                {onAddModule && (
                    <Button
                        fullWidth
                        variant="flat"
                        radius="full"
                        startContent={<Plus size={16} />}
                        onPress={onAddModule}
                        className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                        Añadir módulo
                    </Button>
                )}
            </div>

            {/* Auto-save indicator */}
            <p className="text-xs text-gray-400 text-center mt-4">
                Los cambios se guardan automáticamente
            </p>
        </div>
    );
}
