import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Button } from "@heroui/react";
import { ExternalLink, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import AnalyticsModal from "@/components/Analytics/AnalyticsModal";
import FormDashboardClient from "@/components/Forms/FormDashboardClient";
import { FormService } from "@/services/FormService";

export const dynamic = "force-dynamic";

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

    const form = await FormService.getForm(formId, session.user.id);

    if (!form) {
        notFound();
    }

    const analytics = await FormService.getFormAnalytics(form._id);
    const questions = await FormService.getFormQuestions(form._id);
    const submissions = await FormService.getFormSubmissions(form._id);

    return (
        <div className="max-w-7xl mx-auto p-6">
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
