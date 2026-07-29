import { render, screen } from "@testing-library/react";
import { CalendarDays } from "lucide-react";
import { describe, expect, it } from "vitest";

import { ReportSummaryCard } from "@/features/reports/components/report-summary-card";

describe("ReportSummaryCard", () => {
  it("renders its label, value, and description", () => {
    render(
      <ReportSummaryCard
        description="All interview sessions created"
        icon={CalendarDays}
        label="Total interviews"
        value={12}
      />,
    );

    expect(
      screen.getByText("Total interviews"),
    ).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();

    expect(
      screen.getByText(
        "All interview sessions created",
      ),
    ).toBeInTheDocument();
  });
});