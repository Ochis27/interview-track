import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  UpcomingInterviews,
} from "@/features/dashboard/components/upcoming-interviews";
import type {
  UpcomingInterview,
} from "@/features/dashboard/types/dashboard";

const interview: UpcomingInterview = {
  id: "interview-1",
  title: "Frontend technical interview",
  type: "TECHNICAL",
  scheduledAt: new Date(2026, 6, 29, 10, 0),
  durationMinutes: 60,
  candidate: {
    firstName: "Ana",
    lastName: "Popescu",
    seniority: "MIDDLE",
  },
};

describe("UpcomingInterviews", () => {
  it("renders an empty state", () => {
    render(
      <UpcomingInterviews interviews={[]} />,
    );

    expect(
      screen.getByRole("status"),
    ).toBeVisible();

    expect(
      screen.getByText("No upcoming interviews"),
    ).toBeVisible();

    expect(
      screen.getByText(
        "Newly scheduled sessions will appear here.",
      ),
    ).toBeVisible();
  });

  it("renders scheduled interview information", () => {
    render(
      <UpcomingInterviews
        interviews={[interview]}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Upcoming interviews",
      }),
    ).toBeVisible();

    expect(
      screen.getByText(
        "Frontend technical interview",
      ),
    ).toBeVisible();

    expect(
      screen.getByText("Ana Popescu"),
    ).toBeVisible();

    expect(
      screen.getByText("Technical"),
    ).toBeVisible();

    expect(
      screen.getByText("Middle"),
    ).toBeVisible();

    expect(
      screen.getByText(
        "Jul 29, 2026 at 10:00",
      ),
    ).toBeVisible();

    expect(
      screen.getByText("60 min"),
    ).toBeVisible();
  });
});