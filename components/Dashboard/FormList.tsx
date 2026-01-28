"use client";

import React, { useState } from "react";
import FormCard from "./FormCard";
import EmptyState from "./EmptyState";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface FormListProps {
    initialForms: any[];
}

export default function FormList({ initialForms }: FormListProps) {
    const [forms, setForms] = useState(initialForms);

    const handleDelete = async (id: string) => {
        // Optimistic update
        const previousForms = [...forms];
        setForms((prev) => prev.filter((f) => (f.shortId || f._id) !== id));

        try {
            const res = await fetch(`/api/forms/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete");
            }

            toast.success("Formulario eliminado correctamente");
        } catch (error) {
            // Revert on error
            setForms(previousForms);
            toast.error("Error al eliminar el formulario");
            console.error(error);
        }
    };

    if (forms.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
                {forms.map((form) => (
                    <motion.div
                        key={form.shortId || form._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    >
                        <FormCard
                            id={form.shortId || form._id}
                            title={form.title}
                            description={form.description}
                            status={form.status}
                            responseCount={0} // TODO: Connect real stats
                            questionCount={form.questionCount || 0}
                            updatedAt={form.updatedAt}
                            onDelete={handleDelete}
                        // FormCard handles copy internally now
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
