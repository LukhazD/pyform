"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { IQuestion } from "@/models/Question";
import { ISubmission } from "@/models/Submission";
import ResponsesView from "@/components/Analytics/ResponsesView";
import { MessageSquareOff } from "lucide-react";

interface FormDashboardClientProps {
    formTitle: string;
    questions?: IQuestion[];
    submissions?: ISubmission[];
}

export default function FormDashboardClient({ formTitle, questions = [], submissions = [] }: FormDashboardClientProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "responses" | "settings">("overview");

    return (
        <div className="flex flex-col gap-6">
            {/* Custom Tab Navigation */}
            <div className="flex items-center gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "overview"
                        ? "text-purple-600"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    Resumen
                    {activeTab === "overview" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("responses")}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "responses"
                        ? "text-purple-600"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    Respuestas
                    {activeTab === "responses" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "settings"
                        ? "text-purple-600"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    Configuración
                    {activeTab === "settings" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="py-4">
                {activeTab === "overview" && (
                    <Card className="p-8 text-center" shadow="sm" radius="lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bienvenido al panel de tu formulario</h3>
                        <p className="text-gray-500 mb-4">Aquí puedes gestionar las respuestas y ver el rendimiento.</p>
                        <Button variant="flat" color="secondary" className="bg-purple-50 text-purple-700">
                            Compartir formulario
                        </Button>
                    </Card>
                )}

                {activeTab === "responses" && (
                    submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <MessageSquareOff size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no hay respuestas</h3>
                            <p className="text-gray-500 max-w-md text-center mb-8">
                                Comparte tu formulario con tu audiencia. Una vez que recibas respuestas, las verás aparecer aquí en tiempo real con gráficas y análisis detallados.
                            </p>
                            <Button variant="flat" color="secondary" className="font-medium">
                                Copiar enlace del formulario
                            </Button>
                        </div>
                    ) : (
                        <ResponsesView questions={questions} submissions={submissions} />
                    )
                )}

                {activeTab === "settings" && (
                    <Card className="p-6 max-w-2xl" shadow="sm" radius="lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
                        <p className="text-gray-500 text-sm">Próximamente: configuración de notificaciones, integración con webhooks y más.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
