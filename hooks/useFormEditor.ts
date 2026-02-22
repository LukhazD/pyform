import { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { useDebounce } from "@/hooks/useDebounce";

import { FormStyling } from "@/types/FormStyling";

// ... existing imports

// Module interface
export interface Module {
    id: string; // The UUID used by frontend
    _id?: string; // The MongoDB ObjectId
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
}

interface FormState {
    _id: string;
    shortId?: string;
    title: string;
    description?: string;
    status: string;
    publishedAt?: string;
    settings?: any;
    styling?: FormStyling;
}

export function useFormEditor(formId: string | null) {
    const [form, setForm] = useState<FormState | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    // Fetch initial data
    useEffect(() => {
        if (!formId) return;

        const fetchData = async () => {
            try {
                const [formRes, questionsRes] = await Promise.all([
                    fetch(`/api/forms/${formId}`),
                    fetch(`/api/forms/${formId}/questions`)
                ]);

                if (formRes.status === 403 || formRes.status === 401) {
                    setError("No tienes permiso para editar este formulario");
                    return;
                }

                if (formRes.ok) {
                    const formData = await formRes.json();
                    setForm(formData);
                } else {
                    setError("Error al cargar el formulario");
                }

                if (questionsRes.ok) {
                    const questionsData = await questionsRes.json();
                    // CRITICAL FIX: Ensure every module has an 'id' property.
                    // If it comes from DB without 'id' (old data), use '_id' as fallback.
                    const mappedModules = questionsData.map((q: any) => ({
                        ...q,
                        id: q.id || q._id
                    }));
                    setModules(mappedModules);
                    // Auto-select first module so the editor starts ready
                    if (mappedModules.length > 0) {
                        setSelectedModuleId(mappedModules[0].id);
                    }
                    setIsLoaded(true);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Ocurrió un error inesperado");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formId]);

    // Auto-save logic
    const debouncedModules = useDebounce(modules, 1000);

    useEffect(() => {
        if (!formId || loading || !isLoaded) return;

        const saveModules = async () => {
            setSaving(true);
            try {
                await fetch(`/api/forms/${formId}/questions`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    // Ensure we don't send malformed React synthetic events or cyclic references
                    body: JSON.stringify(debouncedModules),
                });
                setLastSaved(new Date());
            } catch (error) {
                console.error("Error saving modules:", error);
            } finally {
                setSaving(false);
            }
        };

        // If it's loaded, we can save. This allows saving 0 modules if the user deleted them all.
        saveModules();
    }, [debouncedModules, formId, loading, isLoaded]);

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

    const getDefaultTitle = (type: string) => {
        switch (type) {
            case "WELCOME": return "¡Te damos la bienvenida!";
            case "QUOTE": return "Una frase para inspirar";
            case "GOODBYE": return "¡Gracias por tus respuestas!";
            case "TEXT": return "¿Cómo te llamas?";
            case "EMAIL": return "¿Cuál es tu correo electrónico?";
            case "NUMBER": return "Ingresa una cantidad";
            case "PHONE": return "¿A qué número podemos llamarte?";
            case "URL": return "¿Cuál es tu página web?";
            case "TEXTAREA": return "Cuéntanos más sobre ti";
            case "MULTIPLE_CHOICE": return "Selecciona una opción";
            case "CHECKBOXES": return "Elige todas las opciones que apliquen";
            case "DROPDOWN": return "Selecciona de la lista";
            case "DATE": return "¿Cuándo sucedió?";
            case "FILE_UPLOAD": return "Sube tu archivo aquí";
            default: return `Nueva pregunta ${type}`;
        }
    };

    const handleAddModule = (type: string, position?: number) => {
        const newModule = {
            id: `${type.toLowerCase()}-${nanoid(6)}`,
            type: type as any,
            order: position ?? modules.length,
            title: getDefaultTitle(type),
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
        const { _id, id: originalId, ...moduleProps } = moduleToDuplicate;

        const duplicatedModule = {
            ...moduleProps,
            id: `${moduleToDuplicate.type.toLowerCase()}-${nanoid(6)}`,
            title: `${moduleToDuplicate.title || "Módulo"} (copia)`,
        };

        const index = modules.findIndex((m) => m.id === id);
        const newModules = [...modules];
        newModules.splice(index + 1, 0, duplicatedModule);
        setModules(newModules.map((m, i) => ({ ...m, order: i })));
        setSelectedModuleId(duplicatedModule.id);
    };

    const handlePublish = async () => {
        if (!formId) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/forms/${formId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "published",
                    publishedAt: new Date()
                }),
            });
            if (res.ok) {
                setForm((prev: any) => ({
                    ...prev,
                    status: "published",
                    publishedAt: new Date().toISOString()
                }));
            }
        } catch (error) {
            console.error("Error publishing form:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleUnpublish = async () => {
        if (!formId) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/forms/${formId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "draft"
                }),
            });
            if (res.ok) {
                setForm((prev: any) => ({
                    ...prev,
                    status: "draft"
                }));
            }
        } catch (error) {
            console.error("Error unpublishing form:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateFormStyling = async (stylingUpdates: Partial<FormStyling>) => {
        if (!form) return;

        // Optimistic update
        const updatedForm = {
            ...form,
            styling: { ...(form.styling || {}), ...stylingUpdates }
        };
        setForm(updatedForm);

        // Debounced save could be better, but doing direct save for now as these are infrequent
        if (!formId) return;
        setSaving(true);
        try {
            await fetch(`/api/forms/${formId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    styling: { ...(form.styling || {}), ...stylingUpdates }
                }),
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Error updating form styling:", error);
            // Revert on error? For now keeping simple
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateForm = async (updates: any) => {
        if (!form) return;

        // Optimistic update
        // Check if updates are for root fields (title, description) or settings
        const updatedForm = { ...form };

        Object.keys(updates).forEach(key => {
            if (key === 'settings') {
                updatedForm.settings = { ...updatedForm.settings, ...updates.settings };
            } else {
                (updatedForm as any)[key] = updates[key];
            }
        });

        setForm(updatedForm);

        if (!formId) return;
        setSaving(true);
        try {
            await fetch(`/api/forms/${formId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Error updating form:", error);
        } finally {
            setSaving(false);
        }
    };

    return {
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
        setModules, // Exposed for any direct manipulation if needed
        error
    };
}
