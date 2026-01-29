"use client";

import { Card, Button, Avatar } from "@heroui/react";
import Link from "next/link";
import { ExternalLink, BarChart3, ChevronRight } from "lucide-react";
import { IFormAnalytics } from "@/models/FormAnalytics";

interface FormAnalyticsItem {
    formId: string;
    title: string;
    shortId: string;
    totalSubmissions: number;
    completionRate: number;
}

export default function GlobalFormsList({ forms }: { forms: FormAnalyticsItem[] }) {
    if (forms.length === 0) {
        return (
            <Card className="p-8 text-center mt-8">
                <p className="text-gray-500">No tienes formularios con datos aún.</p>
            </Card>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Formulario</h3>
            <div className="space-y-4">
                {forms.map((form) => (
                    <Card key={form.formId} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow" shadow="sm" radius="lg">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{form.title}</h4>
                                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                    <span>{form.totalSubmissions} respuestas</span>
                                    <span>{form.completionRate}% completado</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button
                                as={Link}
                                href={`/dashboard/forms/${form.formId}?tab=analytics`}
                                color="secondary"
                                variant="flat"
                                radius="full"
                                endContent={<ChevronRight size={16} />}
                                size="sm"
                            >
                                Ver detalles
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
