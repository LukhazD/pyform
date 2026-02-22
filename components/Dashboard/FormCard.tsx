/* eslint-disable no-unused-vars */
"use client";

import { Card, Chip, Button } from "@heroui/react";
import { MoreVertical, Edit, Eye, Copy, Trash2, ArchiveRestore } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import Link from "next/link";
import toast from "react-hot-toast";

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

const statusConfig = {
    draft: { label: "Borrador", color: "default" as const },
    published: { label: "Publicado", color: "default" as const },
    closed: { label: "Cerrado", color: "warning" as const },
};

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
}

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
    const statusInfo = statusConfig[status];

    const handleCopyLink = async () => {
        const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
        const url = `${origin}/f/${id}`;

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                toast.success("¡Enlace copiado!");
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
                toast.success("¡Enlace copiado!");
            } else {
                throw new Error("Copy failed");
            }
        } catch (err) {
            console.error('Failed to copy', err);
            toast.error("Error al copiar. el enlace es: " + url);
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
                            color={statusInfo.color}
                            variant="flat"
                            className="flex-shrink-0"
                        >
                            {statusInfo.label}
                        </Chip>
                    </div>

                    {description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{description}</p>
                    )}

                    <p className="text-sm text-gray-400 mt-2">
                        {questionCount} preguntas • {responseCount} respuestas
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
                        aria-label="Acciones del formulario"
                        onAction={(key) => handleAction(String(key))}
                    >
                        <DropdownItem
                            key="edit"
                            startContent={<Edit size={16} />}
                            href={`/dashboard/forms/${id}/edit`}
                            as={Link}
                        >
                            Editar
                        </DropdownItem>
                        <DropdownItem
                            key="view"
                            startContent={<Eye size={16} />}
                            href={`/f/${id}`}
                            as={Link}
                        >
                            Ver formulario
                        </DropdownItem>
                        <DropdownItem
                            key="copy"
                            startContent={<Copy size={16} />}
                        >
                            Copiar enlace
                        </DropdownItem>
                        {status === "published" && (
                            <DropdownItem
                                key="unpublish"
                                startContent={<ArchiveRestore size={16} />}
                            >
                                Marcar como borrador
                            </DropdownItem>
                        )}
                        <DropdownItem
                            key="delete"
                            startContent={<Trash2 size={16} />}
                            className="text-danger"
                            color="danger"
                        >
                            Eliminar
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                    Editado {formatRelativeTime(updatedAt)}
                </span>

                <div className="flex gap-2">
                    <Button
                        as={Link}
                        href={`/dashboard/forms/${id}`}
                        size="md"
                        radius="md"
                        variant="light"
                    >
                        Ver respuestas
                    </Button>
                    <Button
                        as={Link}
                        href={`/dashboard/forms/${id}/edit`}
                        size="md"
                        variant="light"
                        radius="md"
                        className="text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] hover:text-[#1a1a1a]"
                    >
                        Editar
                    </Button>
                </div>
            </div>
        </Card>
    );
}
