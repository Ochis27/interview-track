import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InterviewDetailsContext } from "@/features/interviews/components/interview-details-context";
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
  notes: "Focus on architecture and testing.",
  completedAt: null,
  createdAt: new Date(2026, 6, 29, 8),
  updatedAt: new Date(2026, 6, 29, 8),
  hasFeedback: true,
  candidate: {
    id: "candidate-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    targetRole: "Senior Frontend Engineer",
    seniority: SeniorityLevel.SENIOR,
  },
};

describe("InterviewDetailsContext", () => {
  it("renders candidate, notes, and submitted feedback", () => {
    render(
      <InterviewDetailsContext
        interview={interview}
      />,
    );

    expect(screen.getByText("Ada Lovelace"))
      .toBeInTheDocument();

    expect(
      screen.getAllByText("ada@example.com"),
    ).toHaveLength(2);

    expect(
      screen.getByText("Senior Frontend Engineer"),
    ).toBeInTheDocument();

    expect(screen.getByText("SENIOR"))
      .toBeInTheDocument();

    expect(
      screen.getByText(
        "Focus on architecture and testing.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Submitted"))
      .toBeInTheDocument();

    expect(
      screen.getByText(
        "Structured feedback has been submitted for this interview.",
      ),
    ).toBeInTheDocument();
  });

  it("renders empty notes and pending feedback", () => {
    render(
      <InterviewDetailsContext
        interview={{
          ...interview,
          notes: null,
          hasFeedback: false,
          candidate: {
            ...interview.candidate,
            targetRole: null,
          },
        }}
      />,
    );

    expect(
      screen.getByText(
        "No preparation notes were added.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Not specified"))
      .toBeInTheDocument();

    expect(screen.getByText("Not submitted"))
      .toBeInTheDocument();

    expect(
      screen.getByText(
        "Feedback has not been submitted for this interview.",
      ),
    ).toBeInTheDocument();
  });
});