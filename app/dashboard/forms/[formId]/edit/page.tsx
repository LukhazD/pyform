"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, Save, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import EditorLayout from "@/components/Editor/EditorLayout";
import {
    DropdownMenu,
    DropdownTrigger,
    DropdownItem,
    Dropdown
} from "@heroui/dropdown";
import { useFormEditor } from "@/hooks/useFormEditor";

interface Props {
    params: Promise<{ formId: string }>;
}

export default function FormEditorPage({ params }: Props) {
    const [formParams, setFormParams] = useState<{ formId: string } | null>(null);

    // Unwrap params 
    React.useEffect(() => {
        params.then(setFormParams);
    }, [params]);

    const {
        form,
        modules,
        selectedModuleId,
        loading,
        saving,
        lastSaved,
        handleSelectModule,
        handleUpdateModule,
        handleAddModule,
        handleDeleteModule,
        handleReorderModules,
        handleDuplicateModule,
        handlePublish,
        handleUpdateFormStyling,
        setModules
    } = useFormEditor(formParams?.formId || null);

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Cargando editor...</div>;
    }

    return (
        <div className="flex flex-col bg-gray-50 h-full">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms">
                        <Button isIconOnly variant="light" radius="full" size="sm">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-medium text-gray-900">{form?.title || "Sin título"}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 capitalize">{form?.status || "draft"}</span>
                            {saving ? (
                                <span className="text-xs text-gray-400 animate-pulse">Guardando...</span>
                            ) : lastSaved ? (
                                <span className="text-xs text-green-500">Guardado</span>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex">
                        <Button
                            as={Link}
                            href={`/f/${form?.shortId || form?._id}/preview`}
                            target="_blank"
                            variant="bordered"
                            radius="full"
                            size="sm"
                            startContent={<Eye size={16} />}
                        >
                            Vista Previa
                        </Button>
                        <Button
                            color={form?.status === "published" ? "default" : "primary"}
                            radius="full"
                            size="sm"
                            startContent={<Save size={16} />}
                            className={form?.status === "published" ? "bg-gray-200 text-gray-600" : "bg-green-500"}
                            onPress={handlePublish}
                            isDisabled={form?.status === "published"}
                        >
                            {form?.status === "published" ? "Publicado" : "Publicar"}
                        </Button>
                    </div>

                    <Dropdown className="ml-2 md:hidden">
                        <DropdownTrigger>
                            <Button isIconOnly variant="light" radius="full" size="sm">
                                <MoreHorizontal size={20} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key={"preview"}>
                                <Button
                                    as={Link}
                                    href={`/f/${form?.shortId || form?._id}/preview`}
                                    target="_blank"
                                    variant="bordered"
                                    radius="full"
                                    size="sm"
                                    startContent={<Eye size={16} />}
                                    className="w-full"
                                >
                                    Vista Previa
                                </Button>
                            </DropdownItem>
                            <DropdownItem key={"publish"}>
                                <Button
                                    color={form?.status === "published" ? "default" : "primary"}
                                    radius="full"
                                    size="sm"
                                    startContent={<Save size={16} />}
                                    className={form?.status === "published" ? "bg-gray-200 text-gray-600 w-full" : "bg-green-500 w-full"}
                                    onPress={handlePublish}
                                    isDisabled={form?.status === "published"}

                                >
                                    {form?.status === "published" ? "Publicado" : "Publicar"}
                                </Button>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </header>

            {/* Editor Content */}
            <EditorLayout
                modules={modules}
                selectedModuleId={selectedModuleId}
                onSelectModule={handleSelectModule}
                onUpdateModule={handleUpdateModule}
                onDeleteModule={handleDeleteModule}
                onAddModule={handleAddModule}
                onReorderModules={handleReorderModules}
                onDuplicateModule={handleDuplicateModule}
                onModulesChange={setModules}
                formStyling={form?.styling}
                onUpdateFormStyling={handleUpdateFormStyling}
            />
        </div>
    );
}
