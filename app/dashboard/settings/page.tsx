import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ButtonSignout from "@/components/ButtonSignout";
import {
    Settings as SettingsIcon,
    Mail,
    MessageCircle,
    Ticket,
    User,
    Shield,
    Crown
} from "lucide-react";
import config from "@/config";
import SubscriptionCard from "@/components/Dashboard/SubscriptionCard";

export default async function SettingsPage() {
    const session = await auth();

    if (!session) {
        redirect("/api/auth/signin");
    }

    const userInitials = session.user?.name
        ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : session.user?.email?.charAt(0).toUpperCase() || 'U';

    const supportEmail = "soporte@pyform.com";
    const whatsappNumber = "+34642789051";
    const whatsappMessage = encodeURIComponent(`Hola, necesito ayuda con mi cuenta de ${config.appName}. Mi email es: ${session.user?.email}`);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-gray-900 rounded-xl shadow-lg">
                    <SettingsIcon className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
                    <p className="text-sm text-gray-500">Gestiona tu cuenta y preferencias</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Profile Card - Hero Style */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    <div className="relative p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "Avatar"}
                                        className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white/20 shadow-2xl">
                                        {userInitials}
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 p-1.5 bg-green-500 rounded-full ring-4 ring-gray-900">
                                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-white">
                                        {session.user?.name || "Usuario"}
                                    </h2>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-xs font-semibold text-gray-900">
                                        <Crown size={12} />
                                        Pro
                                    </span>
                                </div>
                                <p className="text-gray-400 flex items-center gap-2 mb-4">
                                    <Mail size={16} />
                                    {session.user?.email}
                                </p>

                                {/* Quick Stats */}
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <User size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-300">Cuenta activa</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <Shield size={14} className="text-green-400" />
                                        <span className="text-sm text-gray-300">Verificado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Card */}
                <SubscriptionCard session={session} />

                {/* Logout Button */}
                <div className="flex justify-center pt-8">
                    <ButtonSignout
                        className="btn btn-error btn-outline gap-2"
                    >
                        <User size={18} />
                        Cerrar Sesión
                    </ButtonSignout>
                </div>
            </div>
        </div>
    );
}



