"use client";

import { useState, useMemo } from "react";
import { Card, Button, Pagination } from "@heroui/react";
import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";

interface AnalyticsFormProps {
    formId: string;
    title: string;
    shortId: string;
    views: number;
    submissions: number;
    completedSubmissions: number;
    completionRate: number;
}

export default function GlobalFormsList({ forms }: { forms: AnalyticsFormProps[] }) {
    const [page, setPage] = useState(1);
    const rowsPerPage = 4;

    const pages = Math.ceil(forms.length / rowsPerPage);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return forms.slice(start, end);
    }, [page, forms]);

    if (forms.length === 0) {
        return (
            <Card className="p-8 text-center mt-8">
                <p className="text-gray-500">No tienes formularios con datos aún.</p>
            </Card>
        );
    }

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Formularios respondidos</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {items.map((form) => (
                    <Card key={form.formId} className="p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow h-full border-none" shadow="sm" radius="md">
                        <div className="flex flex-row items-center gap-3 w-full">
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600 w-fit">
                                <BarChart3 size={20} />
                            </div>
                            <div className="w-full">
                                <h4 className="font-semibold text-gray-900 truncate">{form.title}</h4>
                                <div className="flex flex-row gap-1 text-sm text-gray-500 mt-2">
                                    <span className="truncate text-blue-500">{form.views} vistas</span>
                                    <span className="truncate text-green-500">{form.completionRate}% completados</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full mt-auto pt-2">
                            <Button
                                as={Link}
                                href={`/dashboard/forms/${form.formId}?tab=analytics`}
                                color="secondary"
                                variant="flat"
                                radius="md"
                                endContent={<ChevronRight size={16} />}
                                size="sm"
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                Ver detalles
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {pages > 1 && (
                <div className="flex justify-center w-full mt-4">
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="secondary"
                        page={page}
                        total={pages}
                        onChange={(page) => setPage(page)}
                    />
                </div>
            )}
        </div>
    );
}
