import React from "react";
import { Input, Select, SelectItem, Textarea, Switch } from "@heroui/react";
import { FormStyling } from "@/types/FormStyling";

interface GeneralSettingsPanelProps {
    styling: FormStyling;
    onUpdateStyling: (updates: Partial<FormStyling>) => void;
    formMetadata?: {
        title?: string;
        description?: string;
        settings?: any;
    };
    onUpdateForm?: (updates: any) => void;
    isMobile?: boolean; // For future responsiveness tweaks if needed
}

export default function GeneralSettingsPanel({
    styling,
    onUpdateStyling,
    formMetadata,
    onUpdateForm,
}: GeneralSettingsPanelProps) {
    return (
        <div className="p-4 space-y-8">
            {/* Basic Info Section */}
            {onUpdateForm && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Información Básica</h3>
                    <Input
                        label="Título del Formulario"
                        placeholder="Mi formulario increíble"
                        value={formMetadata?.title || ""}
                        onChange={(e) => onUpdateForm({ title: e.target.value })}
                    />
                    <Textarea
                        label="Descripción (Interna)"
                        placeholder="Descripción para tu panel de control"
                        value={formMetadata?.description || ""}
                        onChange={(e) => onUpdateForm({ description: e.target.value })}
                        minRows={2}
                    />
                </div>
            )}

            {/* Styling Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Estilos Globales</h3>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Color Primario</label>
                    <div className="flex gap-3 items-center">
                        <div className="relative group">
                            <input
                                type="color"
                                value={styling?.primaryColor || "#1a1a1a"}
                                onChange={(e) => onUpdateStyling({ primaryColor: e.target.value })}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="w-10 h-10 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110"
                                style={{ backgroundColor: styling?.primaryColor || "#1a1a1a" }}
                            />
                        </div>
                        <Input
                            placeholder="#000000"
                            value={styling?.primaryColor || "#1a1a1a"}
                            onChange={(e) => onUpdateStyling({ primaryColor: e.target.value })}
                            variant="bordered"
                            radius="lg"
                            className="flex-1"
                            startContent={
                                <div className="text-gray-400 text-sm">#</div>
                            }
                            classNames={{
                                input: "uppercase font-mono",
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-400">Color principal para botones y acentos</p>
                </div>

                <Select
                    label="Fuente"
                    selectedKeys={styling?.fontFamily ? [styling.fontFamily] : ["Inter"]}
                    onChange={(e) => onUpdateStyling({ fontFamily: e.target.value })}
                >
                    <SelectItem key="Inter">Inter</SelectItem>
                    <SelectItem key="Roboto">Roboto</SelectItem>
                    <SelectItem key="Open Sans">Open Sans</SelectItem>
                    <SelectItem key="Lato">Lato</SelectItem>
                    <SelectItem key="Montserrat">Montserrat</SelectItem>
                </Select>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Radio Borde"
                        selectedKeys={styling?.heroUIRadius ? [styling.heroUIRadius] : ["full"]}
                        onChange={(e) => onUpdateStyling({ heroUIRadius: e.target.value as FormStyling["heroUIRadius"] })}
                    >
                        <SelectItem key="none">Cuadrado</SelectItem>
                        <SelectItem key="sm">Pequeño</SelectItem>
                        <SelectItem key="md">Medio</SelectItem>
                        <SelectItem key="lg">Grande</SelectItem>
                        <SelectItem key="full">Redondo</SelectItem>
                    </Select>

                    <Select
                        label="Sombra"
                        selectedKeys={styling?.heroUIShadow ? [styling.heroUIShadow] : ["sm"]}
                        onChange={(e) => onUpdateStyling({ heroUIShadow: e.target.value as FormStyling["heroUIShadow"] })}
                    >
                        <SelectItem key="none">Sin sombra</SelectItem>
                        <SelectItem key="sm">Suave</SelectItem>
                        <SelectItem key="md">Media</SelectItem>
                        <SelectItem key="lg">Fuerte</SelectItem>
                    </Select>
                </div>
            </div>

            {/* Settings Section */}
            {onUpdateForm && formMetadata?.settings && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Configuración</h3>

                    <Switch
                        isSelected={formMetadata.settings.showProgressBar}
                        onValueChange={(isSelected) => onUpdateForm({ settings: { ...formMetadata.settings, showProgressBar: isSelected } })}
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">Barra de Progreso</span>
                            <span className="text-xs text-gray-400">Mostrar barra de progreso visual</span>
                        </div>
                    </Switch>

                    <Switch
                        isSelected={formMetadata.settings.allowMultipleSubmissions}
                        onValueChange={(isSelected) => onUpdateForm({ settings: { ...formMetadata.settings, allowMultipleSubmissions: isSelected } })}
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">Múltiples Respuestas</span>
                            <span className="text-xs text-gray-400">Permitir que un usuario responda varias veces</span>
                        </div>
                    </Switch>
                </div>
            )}
        </div>
    );
}
