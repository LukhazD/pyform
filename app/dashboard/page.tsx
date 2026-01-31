import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { FileText, MessageSquare, BarChart3 } from "lucide-react";
import Link from "next/link";
import StatsCard from "@/components/Dashboard/StatsCard";
import FormList from "@/components/Dashboard/FormList";
import CreateFormButton from "@/components/Dashboard/CreateFormButton";
import { FormService } from "@/services/FormService";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const [forms, stats] = await Promise.all([
    FormService.getUserForms(session.user.id, 10),
    FormService.getDashboardStats(session.user.id),
  ]);

  const userName = session.user.name?.split(" ")[0] || "Usuario";

  return (
    <div className="max-w-7xl mx-auto p-4">
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

        {/* Forms List Component (Handles Client State) */}
        <FormList initialForms={JSON.parse(JSON.stringify(forms))} />
      </div>
    </div>
  );
}
