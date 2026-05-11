import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import { notFound } from "next/navigation";

interface EditorPageProps {
    params: Promise<{
        formId: string;
    }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const { formId } = await params;
    await connectMongo();

    // Find form by shortId or _id
    let form;
    if (formId.match(/^[0-9a-fA-F]{24}$/)) {
        form = await Form.findOne({ _id: formId, userId: session.user.id });
    } else {
        form = await Form.findOne({ shortId: formId, userId: session.user.id });
    }

    if (!form) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold mb-4">Editor de Formulario</h1>
            <p className="text-gray-600 mb-4">ID: {formId}</p>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-2">{form.title}</h2>
                <p className="text-gray-500">El editor completo estará disponible pronto.</p>
            </div>
        </div>
    );
}
