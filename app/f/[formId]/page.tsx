import { notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import Question from "@/models/Question";
import PublicFormView from "@/components/Forms/PublicFormView";

export const dynamic = "force-dynamic";

async function getFormWithQuestions(formId: string) {
    await connectMongo();

    // Try finding by shortId first, then by _id
    let form;
    if (formId.match(/^[0-9a-fA-F]{24}$/)) {
        form = await Form.findById(formId).lean();
    } else {
        form = await Form.findOne({ shortId: formId }).lean();
    }

    if (!form) {
        return null;
    }

    // Get questions for this form
    const questions = await Question.find({ formId: form._id })
        .sort({ order: 1 })
        .lean();

    return {
        form: JSON.parse(JSON.stringify(form)),
        questions: JSON.parse(JSON.stringify(questions)),
    };
}

export default async function PublicFormPage({
    params,
}: {
    params: Promise<{ formId: string }>;
}) {
    const { formId } = await params;
    const data = await getFormWithQuestions(formId);

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

    return <PublicFormView form={data.form} questions={data.questions} />;
}
