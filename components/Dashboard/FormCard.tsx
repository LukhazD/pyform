/* eslint-disable no-unused-vars */
"use client";

import { Card, Chip, Button } from "@heroui/react";
import { MoreVertical, Edit, Eye, Copy, Trash2, ArchiveRestore } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface FormCardProps {
    id: string;
    title: string;
    description?: string;
    status: "draft" | "published" | "closed";
    responseCount: number;
    questionCount: number;
    updatedAt: Date;
    onDelete?: (id: string) => void;
    onUpdateStatus?: (id: string, status: string) => void;
}

const statusColors = {
    draft: "default" as const,
    published: "default" as const,
    closed: "warning" as const,
};

export default function FormCard({
    id,
    title,
    description,
    status,
    responseCount,
    questionCount,
    updatedAt,
    onDelete,
    onUpdateStatus,
}: FormCardProps) {
    const t = useTranslations("forms.card");

    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t("today");
        if (diffDays === 1) return t("yesterday");
        if (diffDays < 7) return t("daysAgo", { count: diffDays });
        if (diffDays < 30) return t("weeksAgo", { count: Math.floor(diffDays / 7) });
        return t("monthsAgo", { count: Math.floor(diffDays / 30) });
    };

    const statusLabel = t(status);
    const statusColor = statusColors[status];

    const handleCopyLink = async () => {
        const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
        const url = `${origin}/f/${id}`;

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                toast.success(t("linkCopied"));
                return;
            }
        } catch (err) {
            console.warn("Clipboard API failed, trying fallback...", err);
        }

        try {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                toast.success(t("linkCopied"));
            } else {
                throw new Error("Copy failed");
            }
        } catch (err) {
            console.error('Failed to copy', err);
            toast.error(t("copyError") + url);
        }
    };

    const handleAction = (key: string) => {
        switch (key) {
            case "copy":
                handleCopyLink();
                break;
            case "delete":
                if (onDelete) onDelete(id);
                break;
            case "unpublish":
                if (onUpdateStatus) onUpdateStatus(id, "draft");
                break;
        }
    };

    return (
        <Card
            shadow="sm"
            radius="md"
            className="p-5 hover:shadow-md transition-all duration-200 border border-gray-100"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                        <Chip
                            size="sm"
                            color={statusColor}
                            variant="flat"
                            className="flex-shrink-0"
                        >
                            {statusLabel}
                        </Chip>
                    </div>

                    {description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{description}</p>
                    )}

                    <p className="text-sm text-gray-400 mt-2">
                        {questionCount} {t("questions")} • {responseCount} {t("responses")}
                    </p>
                </div>

                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            variant="light"
                            radius="md"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <MoreVertical size={18} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label={t("actions")}
                        onAction={(key) => handleAction(String(key))}
                    >
                        <DropdownItem
                            key="edit"
                            startContent={<Edit size={16} />}
                            href={`/dashboard/forms/${id}/edit`}
                            as={Link}
                        >
                            {t("editAction")}
                        </DropdownItem>
                        <DropdownItem
                            key="view"
                            startContent={<Eye size={16} />}
                            href={`/f/${id}`}
                            as={Link}
                        >
                            {t("viewForm")}
                        </DropdownItem>
                        <DropdownItem
                            key="copy"
                            startContent={<Copy size={16} />}
                        >
                            {t("copyLink")}
                        </DropdownItem>
                        {status === "published" && (
                            <DropdownItem
                                key="unpublish"
                                startContent={<ArchiveRestore size={16} />}
                            >
                                {t("markAsDraft")}
                            </DropdownItem>
                        )}
                        <DropdownItem
                            key="delete"
                            startContent={<Trash2 size={16} />}
                            className="text-danger"
                            color="danger"
                        >
                            {t("deleteAction")}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                    {t("edited", { time: formatRelativeTime(updatedAt) })}
                </span>

                <div className="flex gap-2">
                    <Button
                        as={Link}
                        href={`/dashboard/forms/${id}`}
                        size="md"
                        radius="md"
                        variant="light"
                    >
                        {t("viewResponses")}
                    </Button>
                    <Button
                        as={Link}
                        href={`/dashboard/forms/${id}/edit`}
                        size="md"
                        variant="light"
                        radius="md"
                        className="text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] hover:text-[#1a1a1a]"
                    >
                        {t("editAction")}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
