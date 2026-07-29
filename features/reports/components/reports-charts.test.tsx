import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { reportsContent } from "@/content/reports";
import {
  InterviewStatus,
  InterviewType,
  Recommendation,
} from "@/generated/prisma/enums";

type ChartDatum = {
  key: string;
  label: string;
  count: number;
};

type DistributionChartProps = {
  color: string;
  data: ChartDatum[];
  description: string;
  emptyMessage: string;
  title: string;
  valueLabel: string;
};

vi.mock(
  "@/features/reports/components/report-distribution-chart",
  () => ({
    ReportDistributionChart: ({
      color,
      data,
      description,
      emptyMessage,
      title,
      valueLabel,
    }: DistributionChartProps) => {
      const hasData = data.some(
        (item) => item.count > 0,
      );

      return (
        <section
          data-color={color}
          data-testid="distribution-chart"
        >
          <h2>{title}</h2>
          <p>{description}</p>

          {hasData ? (
            <div data-testid="chart-data">
              {data.map((item) => (
                <span key={item.key}>
                  {item.label}: {item.count}
                </span>
              ))}

              <span>{valueLabel}</span>
            </div>
          ) : (
            <p>{emptyMessage}</p>
          )}
        </section>
      );
    },
  }),
);

import { ReportsCharts } from "@/features/reports/components/reports-charts";

const populatedData = {
  statusDistribution: [
    {
      key: InterviewStatus.SCHEDULED,
      count: 2,
    },
    {
      key: InterviewStatus.IN_PROGRESS,
      count: 1,
    },
    {
      key: InterviewStatus.COMPLETED,
      count: 4,
    },
    {
      key: InterviewStatus.CANCELLED,
      count: 0,
    },
  ],

  typeDistribution: [
    {
      key: InterviewType.TECHNICAL,
      count: 3,
    },
    {
      key: InterviewType.CODING,
      count: 2,
    },
    {
      key: InterviewType.SYSTEM_DESIGN,
      count: 1,
    },
    {
      key: InterviewType.BEHAVIORAL,
      count: 1,
    },
    {
      key: InterviewType.OTHER,
      count: 0,
    },
  ],

  recommendationDistribution: [
    {
      key: Recommendation.STRONG_HIRE,
      count: 2,
    },
    {
      key: Recommendation.HIRE,
      count: 1,
    },
    {
      key: Recommendation.CONTINUE_PRACTICE,
      count: 1,
    },
    {
      key: Recommendation.NO_HIRE,
      count: 0,
    },
  ],
};

describe("ReportsCharts", () => {
  it("renders report distributions with readable labels", () => {
    render(<ReportsCharts data={populatedData} />);

    expect(
      screen.getByText(
        reportsContent.charts.status.title,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        reportsContent.charts.type.title,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        reportsContent.charts.recommendation.title,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Scheduled: 2"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("In progress: 1"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("System design: 1"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Strong hire: 2"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByTestId("distribution-chart"),
    ).toHaveLength(3);

    expect(
      screen.getAllByTestId("chart-data"),
    ).toHaveLength(3);
  });

  it("renders empty states when every count is zero", () => {
    const emptyData = {
      statusDistribution:
        populatedData.statusDistribution.map((item) => ({
          ...item,
          count: 0,
        })),

      typeDistribution:
        populatedData.typeDistribution.map((item) => ({
          ...item,
          count: 0,
        })),

      recommendationDistribution:
        populatedData.recommendationDistribution.map(
          (item) => ({
            ...item,
            count: 0,
          }),
        ),
    };

    render(<ReportsCharts data={emptyData} />);

    expect(
      screen.getByText(
        reportsContent.charts.status.empty,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        reportsContent.charts.type.empty,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        reportsContent.charts.recommendation.empty,
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("chart-data"),
    ).not.toBeInTheDocument();

    expect(
      screen.getAllByTestId("distribution-chart"),
    ).toHaveLength(3);
  });
});