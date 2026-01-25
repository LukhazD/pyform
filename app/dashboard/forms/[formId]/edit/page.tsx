"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, Save, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import EditorLayout from "@/components/Editor/EditorLayout";
import { useDebounce } from "@/hooks/useDebounce";

// Module interface for Phase 1
interface Module {
    id: string;
    type: string;
    order?: number;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
    options?: Array<{ id: string; label: string; value: string; order: number }>;
    buttonText?: string;
    message?: string;
    showConfetti?: boolean;
    _id?: string;
}

// Mock form data for Phase 1
const mockForm = {
    id: "1",
    title: "Customer Feedback",
    status: "draft" as const,
};

// Mock modules for Phase 1
const initialModules: Module[] = [
    {
        id: "welcome-1",
        type: "WELCOME",
        title: "Bienvenido a nuestra encuesta",
        description: "Nos encantaría conocer tu opinión sobre nuestro servicio.",
        buttonText: "Comenzar",
    },
    {
        id: "text-1",
        type: "TEXT",
        order: 0,
        title: "¿Cuál es tu nombre?",
        description: "Por favor ingresa tu nombre completo",
        placeholder: "Ej: Juan Pérez",
        isRequired: true,
    },
    {
        id: "email-1",
        type: "EMAIL",
        order: 1,
        title: "¿Cuál es tu correo electrónico?",
        placeholder: "tu@email.com",
        isRequired: true,
    },
    {
        id: "multiple-1",
        type: "MULTIPLE_CHOICE",
        order: 2,
        title: "¿Cómo calificarías nuestro servicio?",
        options: [
            { id: "opt-1", label: "Excelente", value: "excellent", order: 0 },
            { id: "opt-2", label: "Bueno", value: "good", order: 1 },
            { id: "opt-3", label: "Regular", value: "regular", order: 2 },
            { id: "opt-4", label: "Malo", value: "bad", order: 3 },
        ],
        isRequired: true,
    },
    {
        id: "goodbye-1",
        type: "GOODBYE",
        title: "¡Gracias por tu tiempo!",
        message: "Tu feedback es muy importante para nosotros.",
        showConfetti: true,
    },
];

interface Props {
    params: Promise<{ formId: string }>;
}

export default function FormEditorPage({ params }: Props) {
    const [formParams, setFormParams] = useState<{ formId: string } | null>(null);
    const [form, setForm] = useState<any>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    // Unwrap params 
    React.useEffect(() => {
        params.then(setFormParams);
    }, [params]);

    // Fetch initial data
    useEffect(() => {
        if (!formParams) return;

        const fetchData = async () => {
            try {
                const [formRes, questionsRes] = await Promise.all([
                    fetch(`/api/forms/${formParams.formId}`),
                    fetch(`/api/forms/${formParams.formId}/questions`)
                ]);

                if (formRes.ok) {
                    const formData = await formRes.json();
                    setForm(formData);
                }

                if (questionsRes.ok) {
                    const questionsData = await questionsRes.json();
                    setModules(questionsData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formParams]);

    // Auto-save logic
    const debouncedModules = useDebounce(modules, 1000);

    useEffect(() => {
        if (!formParams || loading) return;

        const saveModules = async () => {
            setSaving(true);
            try {
                await fetch(`/api/forms/${formParams.formId}/questions`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(debouncedModules),
                });
                setLastSaved(new Date());
            } catch (error) {
                console.error("Error saving modules:", error);
            } finally {
                setSaving(false);
            }
        };

        // Skip initial load save
        if (modules.length > 0) {
            saveModules();
        }
    }, [debouncedModules, formParams, loading]);

    const selectedModule = modules.find((m) => m.id === selectedModuleId);

    const handleSelectModule = (id: string) => {
        setSelectedModuleId(id);
    };

    const handleUpdateModule = (id: string, updates: Partial<Module>) => {
        setModules((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
        );
    };

    const handleDeleteModule = (id: string) => {
        setModules((prev) => prev.filter((m) => m.id !== id));
        if (selectedModuleId === id) {
            setSelectedModuleId(null);
        }
    };

    const handleAddModule = (type: string, position?: number) => {
        const newModule = {
            id: `${type.toLowerCase()}-${Date.now()}`,
            type: type as any,
            order: position ?? modules.length,
            title: `Nueva pregunta ${type}`,
            isRequired: false,
        };

        if (position !== undefined) {
            const newModules = [...modules];
            newModules.splice(position, 0, newModule);
            setModules(newModules);
        } else {
            setModules([...modules, newModule]);
        }

        setSelectedModuleId(newModule.id);
    };

    const handleReorderModules = (fromIndex: number, toIndex: number) => {
        const newModules = [...modules];
        const [removed] = newModules.splice(fromIndex, 1);
        newModules.splice(toIndex, 0, removed);
        // Update order values
        setModules(newModules.map((m, i) => ({ ...m, order: i })));
    };

    const handleDuplicateModule = (id: string) => {
        const moduleToDuplicate = modules.find((m) => m.id === id);
        if (!moduleToDuplicate) return;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...moduleProps } = moduleToDuplicate;

        const duplicatedModule = {
            ...moduleProps,
            id: `${moduleToDuplicate.type.toLowerCase()}-${Date.now()}`,
            title: `${moduleToDuplicate.title || "Módulo"} (copia)`,
        };

        const index = modules.findIndex((m) => m.id === id);
        const newModules = [...modules];
        newModules.splice(index + 1, 0, duplicatedModule);
        setModules(newModules.map((m, i) => ({ ...m, order: i })));
        setSelectedModuleId(duplicatedModule.id);
    };

    const handlePublish = async () => {
        if (!formParams) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/forms/${formParams.formId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "published",
                    publishedAt: new Date()
                }),
            });
            if (res.ok) {
                setForm((prev: any) => ({ ...prev, status: "published" }));
                // Could toast success here
            }
        } catch (error) {
            console.error("Error publishing form:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Cargando editor...</div>;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
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
                                <span className="text-xs text-green-500">Guardado hace unos segundos</span>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        as={Link}
                        href={`/f/${form?.shortId || form?._id}`}
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
                    <Button isIconOnly variant="light" radius="full" size="sm">
                        <MoreHorizontal size={20} />
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
            />
        </div>
    );
}

