import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { Card } from "@heroui/react";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
    const session = await auth();

    if (!session) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="max-w-7xl mx-auto text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-6">
                <BarChart3 size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analíticas Globales</h1>
            <p className="text-gray-500 max-w-md mx-auto">
                Pronto podrás ver aquí el rendimiento agregado de todos tus formularios en un solo lugar.
            </p>
        </div>
    );
}
