"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { IQuestion } from "@/models/Question";
import { ISubmission } from "@/models/Submission";
import ResponsesView from "@/components/Analytics/ResponsesView";
import { Share2, Link as LinkIcon, MessageSquareOff } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface FormDashboardClientProps {
    formTitle: string;
    formShortId: string;
    questions?: IQuestion[];
    submissions?: ISubmission[];
}

export default function FormDashboardClient({ formTitle, formShortId, questions = [], submissions = [] }: FormDashboardClientProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "responses" | "settings">("overview");
    const { copyToClipboard } = useClipboard();
    const t = useTranslations("formDashboard");

    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${formShortId}` : "";

    const handleShareNative = async () => {
        const shareData = {
            title: `Formulario: ${formTitle}`,
            text: t("shareInvite"),
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success(t("shareSuccess"));
            } catch (err) {
                // If the user cancelled the share sheet, this throws an AbortError.
                // We only log non-cancellation errors.
                if ((err as Error).name !== 'AbortError') {
                    console.error("Error al compartir:", err);
                    toast.error(t("shareError"));
                }
            }
        } else {
            toast.error(t("browserNotSupported"));
        }
    };

    const handleCopyLink = () => {
        copyToClipboard(shareUrl);
    };

    return (
        <div className="flex flex-col w-full max-w-full overflow-hidden">
            {/* Custom Tab Navigation */}
            <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-[1px] scrollbar-hide w-full">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "overview"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    {t("overview")}
                    {activeTab === "overview" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("responses")}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "responses"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                >
                    {t("responses")}
                    {activeTab === "responses" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full" />
                    )}
                </button>
                {/* <button
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
                </button> */}
            </div>

            {/* Content Area */}
            <div className="py-4">
                {activeTab === "overview" && (
                    <Card className="p-8 text-center" shadow="sm" radius="md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("welcomeTitle")}</h3>
                        <p className="text-gray-500 mb-6">{t("welcomeDescription")}</p>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Button variant="solid" className="font-medium bg-[#1a1a1a] text-white" onPress={handleShareNative} startContent={<Share2 size={16} />}>
                                {t("shareForm")}
                            </Button>
                            <Button variant="flat" className="font-medium bg-gray-100 text-gray-900" onPress={handleCopyLink} startContent={<LinkIcon size={16} />}>
                                {t("copyLink")}
                            </Button>
                        </div>
                    </Card>
                )}

                {activeTab === "responses" && (
                    submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <MessageSquareOff size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("noResponses")}</h3>
                            <p className="text-gray-500 max-w-md text-center mb-8">
                                {t("noResponsesDescription")}
                            </p>
                            <Button variant="solid" className="font-medium bg-[#1a1a1a] text-white" onPress={handleCopyLink} startContent={<LinkIcon size={16} />}>
                                {t("copyFormLink")}
                            </Button>
                        </div>
                    ) : (
                        <ResponsesView questions={questions} submissions={submissions} />
                    )
                )}

                {activeTab === "settings" && (
                    <Card className="p-6 max-w-2xl" shadow="sm" radius="md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("settingsTitle")}</h3>
                        <p className="text-gray-500 text-sm">{t("settingsDescription")}</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
