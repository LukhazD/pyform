import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import EmptyState from "@/components/Dashboard/EmptyState";
import CreateFormButton from "@/components/Dashboard/CreateFormButton";
import FormList from "@/components/Dashboard/FormList";
import { FormService } from "@/services/FormService";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const forms = await FormService.getUserForms(session.user.id);

    return (
        <div className="max-w-7xl mx-auto p-6">
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
                <FormList
                    initialForms={JSON.parse(JSON.stringify(forms))}
                    formsPerPage={4}
                />
            )}
        </div>
    );
}
