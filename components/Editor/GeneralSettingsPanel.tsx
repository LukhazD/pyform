"use client";

import { Input, Select, SelectItem, Textarea, Switch, Button } from "@heroui/react";
import { ArchiveRestore } from "lucide-react";
import { FormStyling } from "@/types/FormStyling";
import { useTranslations } from "next-intl";

interface GeneralSettingsPanelProps {
    styling: FormStyling;
    onUpdateStyling: (updates: Partial<FormStyling>) => void;
    formMetadata?: {
        title?: string;
        description?: string;
        settings?: any;
        status?: string;
    };
    onUpdateForm?: (updates: any) => void;
    onUnpublish?: () => void;
    isMobile?: boolean; // For future responsiveness tweaks if needed
}

export default function GeneralSettingsPanel({
    styling,
    onUpdateStyling,
    formMetadata,
    onUpdateForm,
    onUnpublish,
}: GeneralSettingsPanelProps) {
    const t = useTranslations("editor.settings");
    return (
        <div className="p-4 space-y-8">
            {/* Form Status Section */}
            {formMetadata?.status === "published" && onUnpublish && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-2">{t("formStatus")}</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-3">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{t("formPublished")}</p>
                            <p className="text-xs text-gray-500">
                                {t("markAsDraftDescription")}
                            </p>
                        </div>
                        <Button
                            color="danger"
                            variant="flat"
                            size="sm"
                            startContent={<ArchiveRestore size={16} />}
                            onPress={onUnpublish}
                            className="w-full sm:w-auto font-medium"
                        >
                            {t("markAsDraft")}
                        </Button>
                    </div>
                </div>
            )}


            {/* Basic Info Section */}
            {onUpdateForm && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-2">{t("basicInfo")}</h3>
                    <Input
                        label={t("formTitle")}
                        placeholder={t("formTitlePlaceholder")}
                        value={formMetadata?.title || ""}
                        onChange={(e) => onUpdateForm({ title: e.target.value })}
                    />
                    <Textarea
                        label={t("internalDescription")}
                        placeholder={t("internalDescriptionPlaceholder")}
                        value={formMetadata?.description || ""}
                        onChange={(e) => onUpdateForm({ description: e.target.value })}
                        minRows={2}
                    />
                </div>
            )}

            {/* Styling Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">{t("globalStyles")}</h3>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">{t("primaryColor")}</label>
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
                            radius="md"
                            className="flex-1"
                            startContent={
                                <div className="text-gray-400 text-sm">#</div>
                            }
                            classNames={{
                                input: "uppercase font-mono",
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-400">{t("primaryColorDescription")}</p>
                </div>

                <Select
                    label={t("font")}
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
                        label={t("borderRadius")}
                        selectedKeys={styling?.heroUIRadius ? [styling.heroUIRadius] : ["full"]}
                        onChange={(e) => onUpdateStyling({ heroUIRadius: e.target.value as FormStyling["heroUIRadius"] })}
                    >
                        <SelectItem key="none">{t("borderRadiusOptions.square")}</SelectItem>
                        <SelectItem key="sm">{t("borderRadiusOptions.small")}</SelectItem>
                        <SelectItem key="md">{t("borderRadiusOptions.medium")}</SelectItem>
                        <SelectItem key="lg">{t("borderRadiusOptions.large")}</SelectItem>
                        <SelectItem key="full">{t("borderRadiusOptions.round")}</SelectItem>
                    </Select>

                    <Select
                        label={t("shadow")}
                        selectedKeys={styling?.heroUIShadow ? [styling.heroUIShadow] : ["sm"]}
                        onChange={(e) => onUpdateStyling({ heroUIShadow: e.target.value as FormStyling["heroUIShadow"] })}
                    >
                        <SelectItem key="none">{t("shadowOptions.none")}</SelectItem>
                        <SelectItem key="sm">{t("shadowOptions.soft")}</SelectItem>
                        <SelectItem key="md">{t("shadowOptions.medium")}</SelectItem>
                        <SelectItem key="lg">{t("shadowOptions.strong")}</SelectItem>
                    </Select>
                </div>
            </div>

            {/* Settings Section */}
            {onUpdateForm && formMetadata?.settings && (
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b pb-2">{t("configuration")}</h3>

                    <Switch
                        isSelected={formMetadata.settings.showProgressBar}
                        onValueChange={(isSelected) => onUpdateForm({ settings: { ...formMetadata.settings, showProgressBar: isSelected } })}
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">{t("progressBar")}</span>
                            <span className="text-xs text-gray-400">{t("progressBarDescription")}</span>
                        </div>
                    </Switch>

                    <Switch
                        isSelected={formMetadata.settings.allowMultipleSubmissions}
                        onValueChange={(isSelected) => onUpdateForm({ settings: { ...formMetadata.settings, allowMultipleSubmissions: isSelected } })}
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-sm">{t("multipleResponses")}</span>
                            <span className="text-xs text-gray-400">{t("multipleResponsesDescription")}</span>
                        </div>
                    </Switch>
                </div>
            )}
        </div>
    );
}
