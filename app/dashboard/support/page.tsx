"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Send, Phone, MessageSquare, HelpCircle } from "lucide-react";
import axios from "axios";

// Common country codes for the region
const countryCodes = [
    { code: "+1", country: "US/CA" },
    { code: "+34", country: "ES" },
    { code: "+52", country: "MX" },
    { code: "+57", country: "CO" },
    { code: "+54", country: "AR" },
    { code: "+56", country: "CL" },
    { code: "+51", country: "PE" },
    { code: "+593", country: "EC" },
    { code: "+507", country: "PA" },
    { code: "+506", country: "CR" },
    { code: "Other", country: "Otro" },
];

export default function SupportPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        countryCode: "+34",
        phoneNumber: "",
        subject: "",
        message: "",
    });

    // Pre-fill user data
    useEffect(() => {
        if (session?.user) {
            setFormData((prev) => ({
                ...prev,
                name: session.user?.name || "",
                email: session.user?.email || "",
            }));
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Combine country code and phone
            const phoneFull = formData.countryCode === "Other"
                ? formData.phoneNumber
                : `${formData.countryCode} ${formData.phoneNumber}`;

            await axios.post("/api/support/ticket", {
                name: formData.name,
                email: formData.email,
                phone: phoneFull,
                subject: formData.subject,
                message: formData.message,
            });

            toast.success("Ticket enviado correctamente. Te responderemos pronto.");
            // Reset sensitive fields only
            setFormData((prev) => ({
                ...prev,
                subject: "",
                message: "",
            }));
        } catch (error) {
            console.error(error);
            toast.error("Error al enviar el ticket. Por favor intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Soporte y Ayuda</h1>
                <p className="text-gray-500">
                    ¿Tienes algún problema o duda? Envíanos un mensaje y te ayudaremos lo antes posible.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Nombre</span>
                            </label>
                            <input
                                type="text"
                                required
                                className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Email */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Email</span>
                            </label>
                            <input
                                type="email"
                                required
                                className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-gray-700">Teléfono</span>
                        </label>
                        <div className="join w-full">
                            <select
                                className="select select-bordered join-item bg-gray-50"
                                value={formData.countryCode}
                                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                            >
                                {countryCodes.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.code} ({c.country})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                required
                                placeholder="600 123 456"
                                className="input input-bordered join-item w-full bg-gray-50 focus:bg-white transition-colors"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-gray-700">Asunto</span>
                        </label>
                        <div className="relative">
                            <HelpCircle className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                placeholder="Ej: Problema con mi suscripción"
                                className="input input-bordered w-full pl-10 bg-gray-50 focus:bg-white transition-colors"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium text-gray-700">Mensaje</span>
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <textarea
                                required
                                className="textarea textarea-bordered w-full pl-10 min-h-[150px] bg-gray-50 focus:bg-white transition-colors text-base"
                                placeholder="Describe tu problema o consulta con el mayor detalle posible..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`btn btn-primary w-full md:w-auto min-w-[200px] ${isLoading ? "loading" : ""}`}
                        >
                            {!isLoading && <Send className="h-4 w-4 mr-2" />}
                            {isLoading ? "Enviando..." : "Enviar Ticket"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Contact Cards & Info */}
            <div className="mt-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    {/* WhatsApp */}
                    <a
                        href={`https://wa.me/34642789051?text=${encodeURIComponent("Hola, necesito ayuda con mi cuenta.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative p-5 rounded-2xl border-2 border-gray-100 hover:border-green-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                            <p className="text-xs text-gray-500 mb-2">Respuesta rápida</p>
                            <span className="text-xs text-green-600 font-medium">Chat directo →</span>
                        </div>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:soporte@pyform.com?subject=Ayuda con Pyform"
                        className="group relative p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                <Send size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Correo Electrónico</h3>
                            <p className="text-xs text-gray-500 mb-2">soporte@pyform.com</p>
                            <span className="text-xs text-blue-600 font-medium">Enviar email →</span>
                        </div>
                    </a>
                </div>

                {/* Operating Hours & FAQ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl flex items-start gap-3">
                        <HelpCircle className="h-6 w-6 shrink-0 mt-0.5 text-gray-600" />
                        <div>
                            <h3 className="font-semibold mb-1 text-gray-900">¿Preguntas Frecuentes?</h3>
                            <p className="text-sm text-gray-600">
                                Antes de enviar un ticket, revisa nuestra documentación. Podrías encontrar la respuesta al instante.
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl flex items-start gap-3">
                        <Phone className="h-6 w-6 shrink-0 mt-0.5 text-gray-600" />
                        <div>
                            <h3 className="font-semibold mb-1 text-gray-900">Horario de Atención</h3>
                            <p className="text-sm text-gray-600">
                                Lunes a Viernes: 9:00 - 18:00 (Hora España).
                                <br />
                                Respondemos lo antes posible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
