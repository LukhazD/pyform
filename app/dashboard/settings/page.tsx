import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { Settings as SettingsIcon } from "lucide-react";
import ButtonAccount from "@/components/ButtonAccount";

export default async function SettingsPage() {
    const session = await auth();

    if (!session) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-gray-900 rounded-lg">
                    <SettingsIcon className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">{session.user?.name}</p>
                            <p className="text-sm text-gray-500">{session.user?.email}</p>
                        </div>
                        <ButtonAccount />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Suscripción</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Gestiona tu plan y métodos de pago.
                    </p>
                    {/* TODO: Add pricing/stripe portal link */}
                </div>
            </div>
        </div>
    );
}
