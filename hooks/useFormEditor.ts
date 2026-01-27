import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { useDebounce } from "@/hooks/useDebounce";

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

export function useFormEditor(formId: string | null) {
    const [form, setForm] = useState<any>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        if (!formId) return;

        const fetchData = async () => {
            try {
                const [formRes, questionsRes] = await Promise.all([
                    fetch(`/api/forms/${formId}`),
                    fetch(`/api/forms/${formId}/questions`)
                ]);

                if (formRes.ok) {
                    const formData = await formRes.json();
                    setForm(formData);
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
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formId]);

    // Auto-save logic
    const debouncedModules = useDebounce(modules, 1000);

    useEffect(() => {
        if (!formId || loading) return;

        const saveModules = async () => {
            setSaving(true);
            try {
                await fetch(`/api/forms/${formId}/questions`, {
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
    }, [debouncedModules, formId, loading]);

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
            id: `${type.toLowerCase()}-${nanoid(6)}`,
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
                setForm((prev: any) => ({ ...prev, status: "published" }));
            }
        } catch (error) {
            console.error("Error publishing form:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateFormStyling = async (stylingUpdates: any) => {
        if (!form) return;

        // Optimistic update
        const updatedForm = {
            ...form,
            styling: { ...form.styling, ...stylingUpdates }
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
                    styling: stylingUpdates
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
        handleUpdateFormStyling,
        setModules // Exposed for any direct manipulation if needed
    };
}
