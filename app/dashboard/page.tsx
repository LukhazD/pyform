import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { FileText, MessageSquare, BarChart3, Plus } from "lucide-react";
import { Button } from "@heroui/react";
import Link from "next/link";
import StatsCard from "@/components/Dashboard/StatsCard";
import FormCard from "@/components/Dashboard/FormCard";
import EmptyState from "@/components/Dashboard/EmptyState";
import connectMongo from "@/libs/mongoose";
import Form from "@/models/Form";
import CreateFormButton from "@/components/Dashboard/CreateFormButton";

export const dynamic = "force-dynamic";

async function getUserForms(userId: string) {
  await connectMongo();
  const forms = await Form.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();
  return forms;
}

async function getStats(userId: string) {
  await connectMongo();
  const totalForms = await Form.countDocuments({ userId });
  const publishedForms = await Form.countDocuments({ userId, status: "published" });

  // TODO: Get actual submission count from Submission model
  const totalResponses = 0;
  const completionRate = 0;

  return {
    totalForms,
    publishedForms,
    totalResponses,
    completionRate,
  };
}

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const [forms, stats] = await Promise.all([
    getUserForms(session.user.id),
    getStats(session.user.id),
  ]);

  const userName = session.user.name?.split(" ")[0] || "Usuario";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Hola, {userName} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Aquí tienes un resumen de tus formularios
          </p>
        </div>

        <CreateFormButton />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Total Formularios"
          value={stats.totalForms}
          icon={<FileText size={24} />}
        />
        <StatsCard
          label="Publicados"
          value={stats.publishedForms}
          icon={<BarChart3 size={24} />}
        />
        <StatsCard
          label="Total Respuestas"
          value={stats.totalResponses}
          icon={<MessageSquare size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          label="Tasa de Completado"
          value={`${stats.completionRate}%`}
          icon={<BarChart3 size={24} />}
        />
      </div>

      {/* Forms Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Tus formularios
          </h2>
          {forms.length > 0 && (
            <Link
              href="/dashboard/forms"
              className="text-sm text-gray-900 hover:text-gray-700 font-medium"
            >
              Ver todos →
            </Link>
          )}
        </div>

        {forms.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {forms.map((form: any) => (
              <FormCard
                key={form._id.toString()}
                id={form.shortId || form._id.toString()}
                title={form.title}
                description={form.description}
                status={form.status}
                responseCount={0}
                questionCount={0}
                updatedAt={form.updatedAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
