import React from "react";
import { Input, Select, SelectItem } from "@heroui/react";

interface GeneralSettingsPanelProps {
    styling: {
        primaryColor?: string;
        fontFamily?: string;
        heroUIRadius?: string;
        heroUIShadow?: string;
        customCSS?: string;
    };
    onUpdateStyling: (updates: any) => void;
    isMobile?: boolean; // For future responsiveness tweaks if needed
}

export default function GeneralSettingsPanel({
    styling,
    onUpdateStyling,
}: GeneralSettingsPanelProps) {
    return (
        <div className="p-4 space-y-6">
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Estilos Globales</h3>

                <Input
                    label="Color Primario"
                    type="color"
                    // Use a default but allow value to override
                    value={styling?.primaryColor || "#3b82f6"}
                    onChange={(e) => onUpdateStyling({ primaryColor: e.target.value })}
                    description="Color principal para botones y acentos"
                    classNames={{
                        input: "h-10 w-full p-1 cursor-pointer",
                    }}
                />

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
                        onChange={(e) => onUpdateStyling({ heroUIRadius: e.target.value })}
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
                        onChange={(e) => onUpdateStyling({ heroUIShadow: e.target.value })}
                    >
                        <SelectItem key="none">Sin sombra</SelectItem>
                        <SelectItem key="sm">Suave</SelectItem>
                        <SelectItem key="md">Media</SelectItem>
                        <SelectItem key="lg">Fuerte</SelectItem>
                    </Select>
                </div>
            </div>
        </div>
    );
}
