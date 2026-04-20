import { auth } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { FileText, MessageSquare, BarChart3 } from "lucide-react";
import Link from "next/link";
import StatsCard from "@/components/Dashboard/StatsCard";
import FormList from "@/components/Dashboard/FormList";
import CreateFormButton from "@/components/Dashboard/CreateFormButton";
import { FormService } from "@/services/FormService";
import { getTranslations } from "next-intl/server";

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

  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const userName = session.user.name?.split(" ")[0] || tCommon("user");

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("greeting", { name: userName })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("summary")}
          </p>
        </div>

        <CreateFormButton />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label={t("stats.totalForms")}
          value={stats.totalForms}
          icon={<FileText size={24} />}
        />
        <StatsCard
          label={t("stats.published")}
          value={stats.publishedForms}
          icon={<BarChart3 size={24} />}
        />
        <StatsCard
          label={t("stats.totalResponses")}
          value={stats.totalResponses}
          icon={<MessageSquare size={24} />}
        />
        <StatsCard
          label={t("stats.completionRate")}
          value={`${Math.min(stats.completionRate, 100)}%`}
          icon={<BarChart3 size={24} />}
        />
      </div>

      {/* Forms Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("yourForms")}
          </h2>
          {forms.length > 0 && (
            <Link
              href="/dashboard/forms"
              className="text-sm text-gray-900 hover:text-gray-700 font-medium"
            >
              {t("viewAll")}
            </Link>
          )}
        </div>

        {/* Forms List Component (Handles Client State) */}
        <FormList initialForms={JSON.parse(JSON.stringify(forms))} />
      </div>
    </div>
  );
}
