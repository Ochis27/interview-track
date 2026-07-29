"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ReportChartDatum = {
  key: string;
  label: string;
  count: number;
};

type ReportDistributionChartProps = {
  color: string;
  data: ReportChartDatum[];
  description: string;
  emptyMessage: string;
  title: string;
  valueLabel: string;
};

export function ReportDistributionChart({
  color,
  data,
  description,
  emptyMessage,
  title,
  valueLabel,
}: ReportDistributionChartProps) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {hasData ? (
          <div
            aria-label={title}
            className="h-80 w-full"
            role="img"
          >
            <ResponsiveContainer
              height="100%"
              width="100%"
            >
              <BarChart
                accessibilityLayer
                data={data}
                margin={{
                  bottom: 12,
                  left: 0,
                  right: 12,
                  top: 8,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  axisLine={false}
                  dataKey="label"
                  interval={0}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill={color}
                  name={valueLabel}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center rounded-lg border border-dashed">
            <p className="px-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}