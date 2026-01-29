import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import FormAnalytics from "@/models/FormAnalytics";
import { notFound } from "next/navigation";
import { Button } from "@heroui/react";
import { ExternalLink, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import AnalyticsModal from "@/components/Analytics/AnalyticsModal";
import FormDashboardClient from "@/components/Forms/FormDashboardClient";

export const dynamic = "force-dynamic";

async function getForm(formId: string, userId: string) {
    await connectMongo();
    // Try finding by _id first, then shortId
    let form;
    if (formId.match(/^[0-9a-fA-F]{24}$/)) {
        form = await Form.findOne({ _id: formId, userId }).lean();
    } else {
        form = await Form.findOne({ shortId: formId, userId }).lean();
    }
    return form ? JSON.parse(JSON.stringify(form)) : null;
}

async function getFormAnalytics(formId: string) {
    await connectMongo();
    const analytics = await FormAnalytics.findOne({ formId }).lean();
    return analytics ? JSON.parse(JSON.stringify(analytics)) : null;
}

// Helper functions for data fetching
async function getFormQuestions(formId: string) {
    await connectMongo();
    const Question = (await import("@/models/Question")).default;
    return await Question.find({ formId }).sort({ order: 1 }).lean();
}

async function getFormSubmissions(formId: string) {
    await connectMongo();
    const Submission = (await import("@/models/Submission")).default;
    return await Submission.find({ formId }).sort({ submittedAt: -1 }).limit(100).lean(); // Limit to 100 for performance
}

export default async function FormDetailPage({
    params
}: {
    params: Promise<{ formId: string }>
}) {
    const session = await auth();
    const { formId } = await params;

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const form = await getForm(formId, session.user.id);

    if (!form) {
        notFound();
    }

    const analytics = await getFormAnalytics(form._id);
    const questions = await getFormQuestions(form._id);
    const submissions = await getFormSubmissions(form._id);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/dashboard/forms" className="hover:text-gray-900">Formularios</Link>
                        <span>/</span>
                        <span className="text-gray-900">{form.title}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <AnalyticsModal data={analytics} formTitle={form.title} />

                    <Button
                        as={Link}
                        href={`/f/${form.shortId}`}
                        target="_blank"
                        variant="bordered"
                        radius="full"
                        startContent={<ExternalLink size={18} />}
                        className="text-gray-700 bg-white"
                    >
                        Ver público
                    </Button>
                    <Button
                        as={Link}
                        href={`/dashboard/forms/${form.shortId || form._id}/edit`}
                        color="secondary"
                        radius="full"
                        startContent={<LayoutDashboard size={18} />}
                        className="bg-purple-500 text-white font-medium"
                    >
                        Abrir Editor
                    </Button>
                </div>
            </div>

            {/* Client Dashboard with Custom Tabs */}
            <FormDashboardClient
                formTitle={form.title}
                questions={JSON.parse(JSON.stringify(questions))}
                submissions={JSON.parse(JSON.stringify(submissions))}
            />
        </div>
    );
}
