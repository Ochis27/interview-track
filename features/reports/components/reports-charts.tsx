import {
  interviewStatusLabels,
  interviewTypeLabels,
  recommendationLabels,
} from "@/content/interviews";
import { reportsContent } from "@/content/reports";
import { ReportDistributionChart } from "@/features/reports/components/report-distribution-chart";
import type { ReportsData } from "@/features/reports/types/reports";

type ReportsChartsProps = {
  data: Pick<
    ReportsData,
    | "statusDistribution"
    | "typeDistribution"
    | "recommendationDistribution"
  >;
};

const chartColors = {
  status: "#2563eb",
  type: "#7c3aed",
  recommendation: "#059669",
} as const;

export function ReportsCharts({
  data,
}: ReportsChartsProps) {
  const charts = reportsContent.charts;

  const statusData = data.statusDistribution.map(
    (item) => ({
      ...item,
      label: interviewStatusLabels[item.key],
    }),
  );

  const typeData = data.typeDistribution.map((item) => ({
    ...item,
    label: interviewTypeLabels[item.key],
  }));

  const recommendationData =
    data.recommendationDistribution.map((item) => ({
      ...item,
      label: recommendationLabels[item.key],
    }));

  return (
    <section
      aria-label={reportsContent.page.title}
      className="grid gap-6 xl:grid-cols-2"
    >
      <ReportDistributionChart
        color={chartColors.status}
        data={statusData}
        description={charts.status.description}
        emptyMessage={charts.status.empty}
        title={charts.status.title}
        valueLabel={reportsContent.units.interviews}
      />

      <ReportDistributionChart
        color={chartColors.type}
        data={typeData}
        description={charts.type.description}
        emptyMessage={charts.type.empty}
        title={charts.type.title}
        valueLabel={reportsContent.units.interviews}
      />

      <div className="xl:col-span-2">
        <ReportDistributionChart
          color={chartColors.recommendation}
          data={recommendationData}
          description={charts.recommendation.description}
          emptyMessage={charts.recommendation.empty}
          title={charts.recommendation.title}
          valueLabel={reportsContent.units.feedback}
        />
      </div>
    </section>
  );
}