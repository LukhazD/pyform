import { notFound } from "next/navigation";
import PublicFormView from "@/components/Forms/PublicFormView";
import { FormService } from "@/services/FormService";
import User from "@/models/User";
import { hasActiveProAccess } from "@/libs/subscriptionUtils";

export const dynamic = "force-dynamic";

export default async function PublicFormPage({
    params,
}: {
    params: Promise<{ formId: string }>;
}) {
    const { formId } = await params;
    const data = await FormService.getFormWithQuestions(formId);

    if (!data) {
        notFound();
    }

    if (data.form.status !== "published") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md mx-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🚧</span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Formulario no disponible</h1>
                    <p className="text-gray-500">
                        Este formulario aún no ha sido publicado por su creador.
                    </p>
                </div>
            </div>
        );
    }

    // Check owner subscription
    const owner = await User.findById(data.form.userId);
    if (!owner || !hasActiveProAccess(owner)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md mx-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Formulario no disponible</h1>
                    <p className="text-gray-500">
                        Este formulario no está aceptando respuestas en este momento.
                    </p>
                </div>
            </div>
        );
    }

    return <PublicFormView form={data.form} questions={data.questions} />;
}

