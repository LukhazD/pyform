import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import { notFound } from "next/navigation";
import { Button, Card, Tabs, Tab } from "@heroui/react";
import { ExternalLink, LayoutDashboard, Share2, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

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
                        href={`/editor/${form.shortId || form._id}`}
                        color="secondary"
                        radius="full"
                        startContent={<LayoutDashboard size={18} />}
                        className="bg-purple-500 text-white font-medium"
                    >
                        Abrir Editor
                    </Button>
                </div>
            </div>

            {/* Overview Tabs */}
            <Tabs
                aria-label="Opciones del formulario"
                color="secondary"
                variant="underlined"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-purple-500",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-purple-600 font-medium text-gray-500"
                }}
            >
                <Tab
                    key="overview"
                    title={
                        <div className="flex items-center space-x-2">
                            <span>Resumen</span>
                        </div>
                    }
                >
                    <div className="py-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <Card className="p-6" shadow="sm" radius="lg">
                                <p className="text-sm text-gray-500">Total Vistas</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                            </Card>
                            <Card className="p-6" shadow="sm" radius="lg">
                                <p className="text-sm text-gray-500">Respuestas</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                            </Card>
                            <Card className="p-6" shadow="sm" radius="lg">
                                <p className="text-sm text-gray-500">Tasa de finalización</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">0%</p>
                            </Card>
                        </div>

                        <Card className="p-8 text-center" shadow="sm" radius="lg">
                            <p className="text-gray-500 mb-4">Aún no hay respuestas para mostrar.</p>
                            <Button variant="flat" color="secondary" className="bg-purple-50 text-purple-700">
                                Compartir formulario
                            </Button>
                        </Card>
                    </div>
                </Tab>
                <Tab
                    key="responses"
                    title={
                        <div className="flex items-center space-x-2">
                            <span>Respuestas</span>
                            {/* <Chip size="sm" variant="flat">0</Chip> */}
                        </div>
                    }
                >
                    <div className="py-6">
                        <Card className="p-12 text-center" shadow="sm" radius="lg">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LayoutDashboard className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin respuestas</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Comparte tu formulario para empezar a recibir respuestas aquí.
                            </p>
                        </Card>
                    </div>
                </Tab>
                <Tab
                    key="settings"
                    title={
                        <div className="flex items-center space-x-2">
                            <span>Configuración</span>
                        </div>
                    }
                >
                    <div className="py-6">
                        <Card className="p-6 max-w-2xl" shadow="sm" radius="lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
                            <p className="text-gray-500 text-sm">Próximamente: configuración de notificaciones, integración con webhooks y más.</p>
                        </Card>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
