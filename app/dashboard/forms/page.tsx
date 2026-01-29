import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import FormCard from "@/components/Dashboard/FormCard";
import EmptyState from "@/components/Dashboard/EmptyState";
import CreateFormButton from "@/components/Dashboard/CreateFormButton";

export const dynamic = "force-dynamic";

import Question from "@/models/Question";
import Submission from "@/models/Submission";

async function getUserForms(userId: string) {
    await connectMongo();
    const forms = await Form.find({ userId })
        .sort({ updatedAt: -1 })
        .lean();

    const formsWithCounts = await Promise.all(
        forms.map(async (form: any) => {
            const [questionCount, responseCount] = await Promise.all([
                Question.countDocuments({ formId: form._id }),
                Submission.countDocuments({ formId: form._id })
            ]);

            return {
                ...form,
                questionCount,
                responseCount
            };
        })
    );

    return JSON.parse(JSON.stringify(formsWithCounts));
}

export default async function FormsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const forms = await getUserForms(session.user.id);

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
