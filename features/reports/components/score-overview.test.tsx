import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { reportsContent } from "@/content/reports";
import { ScoreOverview } from "@/features/reports/components/score-overview";

describe("ScoreOverview", () => {
  it("renders available average scores", () => {
    render(
      <ScoreOverview
        scores={{
          overall: 4.5,
          technical: 4.7,
          communication: 4.1,
        }}
      />,
    );

    expect(
      screen.getByText(reportsContent.scores.title),
    ).toBeInTheDocument();

    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("4.7")).toBeInTheDocument();
    expect(screen.getByText("4.1")).toBeInTheDocument();

    expect(
      screen.getAllByText(
        reportsContent.scores.suffix,
      ),
    ).toHaveLength(3);
  });

  it("renders unavailable scores", () => {
    render(
      <ScoreOverview
        scores={{
          overall: null,
          technical: null,
          communication: null,
        }}
      />,
    );

    expect(
      screen.getAllByText(
        reportsContent.scores.unavailable,
      ),
    ).toHaveLength(3);
  });
});