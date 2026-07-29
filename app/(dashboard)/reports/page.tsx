import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { reportsContent } from "@/content/reports";
import { ReportsCharts } from "@/features/reports/components/reports-charts";
import { ReportsSummary } from "@/features/reports/components/reports-summary";
import { ScoreOverview } from "@/features/reports/components/score-overview";
import { getReportsData } from "@/features/reports/server/get-reports-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: reportsContent.page.title,
  description: reportsContent.page.description,
};

export default async function ReportsPage() {
  const data = await getReportsData();

  return (
    <div className="space-y-6">
      <PageHeader
        description={reportsContent.page.description}
        title={reportsContent.page.title}
      />

      <ReportsSummary summary={data.summary} />

      <ScoreOverview scores={data.averageScores} />

      <ReportsCharts data={data} />
    </div>
  );
}