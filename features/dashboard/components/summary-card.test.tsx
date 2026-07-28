import { UsersRound } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  SummaryCard,
} from "@/features/dashboard/components/summary-card";

describe("SummaryCard", () => {
  it("renders its label, value, and description", () => {
    render(
      <SummaryCard
        label="Total candidates"
        description="Candidate profiles currently tracked"
        value={1250}
        icon={UsersRound}
      />,
    );

    expect(
      screen.getByText("Total candidates"),
    ).toBeVisible();

    expect(
      screen.getByText("1,250"),
    ).toBeVisible();

    expect(
      screen.getByText(
        "Candidate profiles currently tracked",
      ),
    ).toBeVisible();
  });
});