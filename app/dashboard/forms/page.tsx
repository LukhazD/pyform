import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import FormCard from "@/components/Dashboard/FormCard";
import EmptyState from "@/components/Dashboard/EmptyState";
import CreateFormButton from "@/components/Dashboard/CreateFormButton";
import { FormService } from "@/services/FormService";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const forms = await FormService.getUserForms(session.user.id);

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Mis Formularios
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Gestiona y edita todos tus formularios
                    </p>
                </div>

                <CreateFormButton />
            </div>

            {forms.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form: any) => (
                        <FormCard
                            key={form._id}
                            id={form.shortId || form._id}
                            title={form.title}
                            description={form.description}
                            status={form.status}
                            responseCount={form.responseCount || 0}
                            questionCount={form.questionCount || 0}
                            updatedAt={form.updatedAt}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

