"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, Save, Eye, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import EditorLayout from "@/components/Editor/EditorLayout";
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
        setModules,
        error
    } = useFormEditor(formParams?.formId || null);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/f/${form?.shortId || form?._id}`;
        navigator.clipboard.writeText(url)
            .then(() => toast.success("Enlace copiado correctamente"))
            .catch(() => toast.error("Error al copiar el enlace"));
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Cargando editor...</div>;
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <div className="text-xl text-red-500 font-semibold">{error}</div>
                <Link href="/dashboard/forms">
                    <Button color="primary">Volver al Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gray-50 h-full">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms">
                        <Button isIconOnly variant="light" radius="full" size="sm">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-medium text-gray-900 max-w-[150px] sm:max-w-xs truncate">{form?.title || "Sin título"}</h1>
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
                    <Button
                        isIconOnly
                        variant="light"
                        radius="full"
                        size="sm"
                        className="text-gray-500"
                        onPress={handleCopyLink}
                        title="Copiar enlace"
                    >
                        <LinkIcon size={20} />
                    </Button>

                    <Button
                        as={Link}
                        href={`/f/${form?.shortId || form?._id}/preview`}
                        target="_blank"
                        variant="light"
                        radius="full"
                        size="sm"
                        isIconOnly
                        className="text-gray-500"
                        title="Vista previa"
                    >
                        <Eye size={20} />
                    </Button>

                    <Button
                        color={form?.status === "published" && (!lastSaved || !form?.publishedAt || new Date(lastSaved) <= new Date(form.publishedAt)) ? "default" : "primary"}
                        radius="full"
                        size="sm"
                        startContent={form?.status !== "published" || (lastSaved && form?.publishedAt && new Date(lastSaved) > new Date(form.publishedAt)) ? <Save size={16} /> : undefined}
                        className={form?.status === "published" && (!lastSaved || !form?.publishedAt || new Date(lastSaved) <= new Date(form.publishedAt)) ? "bg-gray-200 text-gray-600" : "bg-green-500 text-white"}
                        onPress={handlePublish}
                        isDisabled={form?.status === "published" && (!lastSaved || !form?.publishedAt || new Date(lastSaved) <= new Date(form.publishedAt))}
                        isIconOnly={false}
                    >
                        {form?.status === "published"
                            ? ((lastSaved && form?.publishedAt && new Date(lastSaved) > new Date(form.publishedAt)) ? "Publicar" : "Publicado")
                            : "Publicar"}
                    </Button>
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
