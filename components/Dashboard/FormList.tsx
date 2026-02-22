"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FormCard from "./FormCard";
import EmptyState from "./EmptyState";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormListProps {
    initialForms: any[];
    formsPerPage?: number;
}

const FORMS_PER_PAGE = 4;

export default function FormList({ initialForms, formsPerPage = FORMS_PER_PAGE }: FormListProps) {
    const router = useRouter();
    const [forms, setForms] = useState(initialForms);
    const [currentPage, setCurrentPage] = useState(1);

    // Pagination calculations
    const totalPages = Math.ceil(forms.length / formsPerPage);
    const startIndex = (currentPage - 1) * formsPerPage;
    const endIndex = startIndex + formsPerPage;
    const currentForms = forms.slice(startIndex, endIndex);

    const handleDelete = async (id: string) => {
        // Optimistic update
        const previousForms = [...forms];
        setForms((prev) => prev.filter((f) => (f.shortId || f._id) !== id));

        // Adjust current page if needed after deletion
        const newFormsCount = forms.length - 1;
        const newTotalPages = Math.ceil(newFormsCount / formsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        }

        try {
            const res = await fetch(`/api/forms/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete");
            }

            toast.success("Formulario eliminado correctamente");
            router.refresh();
        } catch (error) {
            // Revert on error
            setForms(previousForms);
            toast.error("Error al eliminar el formulario");
            console.error(error);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const previousForms = [...forms];

        // Optimistic update
        setForms((prev) =>
            prev.map((f) => (f.shortId || f._id) === id ? { ...f, status: newStatus } : f)
        );

        try {
            const res = await fetch(`/api/forms/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            toast.success(newStatus === "draft" ? "Devuelto a borrador" : "Estado actualizado");
            router.refresh();
        } catch (error) {
            setForms(previousForms);
            toast.error("Error al actualizar el estado");
            console.error(error);
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    if (forms.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {currentForms.map((form) => (
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
                                responseCount={form.responseCount || 0}
                                questionCount={form.questionCount || 0}
                                updatedAt={form.updatedAt}
                                onDelete={handleDelete}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Page info */}
            {totalPages > 1 && (
                <p className="text-center text-sm text-gray-500">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, forms.length)} de {forms.length} formularios
                </p>
            )}
        </div>
    );
}

