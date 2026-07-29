import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleCheckBig,
  MessageSquareCheck,
} from "lucide-react";

import { reportsContent } from "@/content/reports";
import { ReportSummaryCard } from "@/features/reports/components/report-summary-card";
import type { ReportsSummary as ReportsSummaryData } from "@/features/reports/types/reports";

type ReportsSummaryProps = {
  summary: ReportsSummaryData;
};

export function ReportsSummary({
  summary,
}: ReportsSummaryProps) {
  const content = reportsContent.summary;
  const percent = reportsContent.units.percent;

  return (
    <section
      aria-label={reportsContent.page.title}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <ReportSummaryCard
        description={content.totalInterviews.description}
        icon={CalendarDays}
        label={content.totalInterviews.label}
        value={summary.totalInterviews}
      />

      <ReportSummaryCard
        description={
          content.completedInterviews.description
        }
        icon={CircleCheckBig}
        label={content.completedInterviews.label}
        value={summary.completedInterviews}
      />

      <ReportSummaryCard
        description={content.completionRate.description}
        icon={ChartNoAxesCombined}
        label={content.completionRate.label}
        value={`${summary.completionRate}${percent}`}
      />

      <ReportSummaryCard
        description={content.feedbackCoverage.description}
        icon={MessageSquareCheck}
        label={content.feedbackCoverage.label}
        value={`${summary.feedbackCoverage}${percent}`}
      />
    </section>
  );
}