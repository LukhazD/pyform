import { Button } from "@heroui/react";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import CreateFormButton from "@/components/Dashboard/CreateFormButton";

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
}

export default function EmptyState({
    title = "No tienes formularios aún",
    description = "Crea tu primer formulario y empieza a recolectar respuestas en minutos.",
    actionLabel = "Crear mi primer formulario",
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <FileText size={40} className="text-gray-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-md mb-8">{description}</p>

            {actionHref ? (
                <Button
                    as={Link}
                    href={actionHref}
                    size="lg"
                    radius="full"
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8"
                    startContent={<Plus size={20} />}
                >
                    {actionLabel}
                </Button>
            ) : (
                <CreateFormButton />
            )}
        </div>
    );
}
