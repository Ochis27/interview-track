import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InterviewDetailsOverview } from "@/features/interviews/components/interview-details-overview";
import type { InterviewDetails } from "@/features/interviews/types/interview-details";
import {
  InterviewStatus,
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";

const interview: InterviewDetails = {
  id: "interview-1",
  title: "Senior frontend interview",
  type: InterviewType.TECHNICAL,
  status: InterviewStatus.SCHEDULED,
  scheduledAt: new Date(2026, 7, 1, 9, 30),
  durationMinutes: 60,
  notes: "Focus on architecture.",
  completedAt: null,
  createdAt: new Date(2026, 6, 29, 8),
  updatedAt: new Date(2026, 6, 29, 8),
  hasFeedback: false,
  feedback: null,
  candidate: {
    id: "candidate-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    targetRole: "Senior Frontend Engineer",
    seniority: SeniorityLevel.SENIOR,
  },
};

describe("InterviewDetailsOverview", () => {
  it("renders scheduled interview information", () => {
    render(
      <InterviewDetailsOverview interview={interview} />,
    );

    expect(
      screen.getByText("Interview overview"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Scheduled"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Technical"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Aug 1, 2026, 09:30"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("60 minutes"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Completed at"),
    ).not.toBeInTheDocument();
  });

  it("renders the completion date", () => {
    render(
      <InterviewDetailsOverview
        interview={{
          ...interview,
          status: InterviewStatus.COMPLETED,
          completedAt: new Date(
            2026,
            7,
            1,
            10,
            30,
          ),
        }}
      />,
    );

    expect(
      screen.getByText("Completed"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Completed at"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Aug 1, 2026, 10:30"),
    ).toBeInTheDocument();
  });
});