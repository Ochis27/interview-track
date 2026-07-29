import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { reportsContent } from "@/content/reports";
import { ReportsSummary } from "@/features/reports/components/reports-summary";

describe("ReportsSummary", () => {
  it("renders all report summary values", () => {
    render(
      <ReportsSummary
        summary={{
          totalInterviews: 12,
          completedInterviews: 8,
          submittedFeedback: 6,
          completionRate: 67,
          feedbackCoverage: 75,
        }}
      />,
    );

    expect(
      screen.getByText(
        reportsContent.summary.totalInterviews.label,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        reportsContent.summary.completedInterviews
          .label,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        reportsContent.summary.completionRate.label,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        reportsContent.summary.feedbackCoverage.label,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });
});