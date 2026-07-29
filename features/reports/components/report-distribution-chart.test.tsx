import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

type ChartDatum = {
  key: string;
  label: string;
  count: number;
};

vi.mock("recharts", () => {
  function ResponsiveContainerMock({
    children,
  }: {
    children: ReactNode;
  }) {
    return (
      <div data-testid="responsive-container">
        {children}
      </div>
    );
  }

  function BarChartMock({
    children,
    data,
  }: {
    children: ReactNode;
    data: ChartDatum[];
  }) {
    return (
      <div data-testid="bar-chart">
        {data.map((item) => (
          <span key={item.key}>
            {item.label}: {item.count}
          </span>
        ))}

        {children}
      </div>
    );
  }

  function BarMock({
    name,
  }: {
    name: string;
  }) {
    return <span>{name}</span>;
  }

  return {
    ResponsiveContainer: ResponsiveContainerMock,
    BarChart: BarChartMock,
    CartesianGrid: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Bar: BarMock,
  };
});

import { ReportDistributionChart } from "@/features/reports/components/report-distribution-chart";

const chartData = [
  {
    key: "SCHEDULED",
    label: "Scheduled",
    count: 3,
  },
  {
    key: "COMPLETED",
    label: "Completed",
    count: 5,
  },
];

describe("ReportDistributionChart", () => {
  it("renders a chart when data is available", () => {
    render(
      <ReportDistributionChart
        color="var(--chart-1)"
        data={chartData}
        description="Interview status distribution"
        emptyMessage="No interview data"
        title="Interviews by status"
        valueLabel="Interviews"
      />,
    );

    expect(
      screen.getByText("Interviews by status"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Interview status distribution",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Interviews by status",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Scheduled: 3"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Completed: 5"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Interviews"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("bar-chart"),
    ).toBeInTheDocument();
  });

  it("renders an empty state when all counts are zero", () => {
    render(
      <ReportDistributionChart
        color="var(--chart-1)"
        data={chartData.map((item) => ({
          ...item,
          count: 0,
        }))}
        description="Interview status distribution"
        emptyMessage="No interview data"
        title="Interviews by status"
        valueLabel="Interviews"
      />,
    );

    expect(
      screen.getByText("No interview data"),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("bar-chart"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("img"),
    ).not.toBeInTheDocument();
  });
});