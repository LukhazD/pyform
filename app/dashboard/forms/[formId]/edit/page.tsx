"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, Save, Eye, Link as LinkIcon, ArchiveRestore } from "lucide-react";
import Link from "next/link";
import EditorLayout from "@/components/Editor/EditorLayout";
import { useFormEditor } from "@/hooks/useFormEditor";
import { useClipboard } from "@/hooks/useClipboard";
import toast from "react-hot-toast";

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
        handleUnpublish,
        handleUpdateFormStyling,
        handleUpdateForm,
        setModules,
        error
    } = useFormEditor(formParams?.formId || null);

    const { copyToClipboard } = useClipboard();

    const handleShareNative = async () => {
        const shareUrl = `${window.location.origin}/f/${form?.shortId || form?._id}`;
        const shareData = {
            title: `Formulario: ${form?.title || "Sin título"}`,
            text: "Te invito a contestar este formulario",
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success("¡Compartido con éxito!");
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error("Error al compartir:", err);
                    toast.error("Hubo un error al intentar compartir");
                }
            }
        } else {
            // Desktop/unsupported fallback
            copyToClipboard(shareUrl);
        }
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
        <div className="fixed inset-0 lg:relative lg:inset-auto flex flex-col h-[100dvh] lg:h-screen overflow-hidden bg-white z-50">
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms">
                        <Button isIconOnly variant="light" radius="md" size="sm">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-medium text-gray-900 max-w-[150px] sm:max-w-xs truncate">{form?.title || "Sin título"}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 capitalize">{
                                form?.status === "draft" ? "Borrador" :
                                    form?.status === "published" ? "Publicado" :
                                        form?.status === "closed" ? "Cerrado" : "Borrador"
                            }</span>
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
                        radius="md"
                        size="sm"
                        className="text-gray-500"
                        onPress={handleShareNative}
                        title="Compartir enlace"
                    >
                        <LinkIcon size={20} />
                    </Button>

                    <Button
                        as={Link}
                        href={`/f/${form?.shortId || form?._id}/preview`}
                        target="_blank"
                        variant="light"
                        radius="md"
                        size="sm"
                        isIconOnly
                        className="text-gray-500"
                        title="Vista previa"
                    >
                        <Eye size={20} />
                    </Button>

                    {form?.status === "published" && (!lastSaved || !form?.publishedAt || new Date(lastSaved) <= new Date(form.publishedAt)) ? (
                        <Button
                            color="default"
                            className="bg-gray-200 text-gray-600"
                            size="sm"
                            radius="md"
                            isDisabled
                        >
                            Publicado
                        </Button>
                    ) : (
                        <Button
                            color="primary"
                            radius="md"
                            size="sm"
                            startContent={<Save size={16} />}
                            className="bg-green-500 text-white"
                            onPress={handlePublish}
                        >
                            {(lastSaved && form?.publishedAt && form?.status === "published" && new Date(lastSaved) > new Date(form.publishedAt))
                                ? "Actualizar"
                                : "Publicar"}
                        </Button>
                    )}
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
                formMetadata={{
                    title: form?.title,
                    description: form?.description,
                    settings: form?.settings,
                    status: form?.status
                }}
                onUpdateForm={handleUpdateForm}
                onUnpublish={handleUnpublish}
            />

        </div>

    );
}
