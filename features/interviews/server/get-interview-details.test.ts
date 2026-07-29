import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  InterviewStatus,
  InterviewType,
  Recommendation,
  SeniorityLevel,
} from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    interviewSession: {
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: {
    debug: mocks.debug,
    error: mocks.error,
  },
}));

import { getInterviewDetails } from "@/features/interviews/server/get-interview-details";

const interviewId = "interview-1";

const baseInterview = {
  id: interviewId,
  title: "Senior frontend interview",
  type: InterviewType.TECHNICAL,
  status: InterviewStatus.COMPLETED,
  scheduledAt: new Date("2026-07-29T09:00:00.000Z"),
  durationMinutes: 60,
  notes: "Focus on React and system design.",
  completedAt: new Date("2026-07-29T10:00:00.000Z"),
  createdAt: new Date("2026-07-28T08:00:00.000Z"),
  updatedAt: new Date("2026-07-29T10:00:00.000Z"),
  candidate: {
    id: "candidate-1",
    firstName: "Ana",
    lastName: "Popescu",
    email: "ana.popescu@example.com",
    targetRole: "Senior Frontend Engineer",
    seniority: SeniorityLevel.SENIOR,
  },
};

const feedback = {
  id: "feedback-1",
  strengths:
    "Strong React knowledge and excellent problem-solving.",
  improvementAreas:
    "Could communicate architectural trade-offs more clearly.",
  recommendation: Recommendation.STRONG_HIRE,
  overallScore: 5,
  technicalScore: 5,
  communicationScore: 4,
  additionalNotes:
    "The candidate performed very well throughout the interview.",
  createdAt: new Date("2026-07-29T10:05:00.000Z"),
  updatedAt: new Date("2026-07-29T10:05:00.000Z"),
};

describe("getInterviewDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns interview details with complete feedback", async () => {
    mocks.findUnique.mockResolvedValue({
      ...baseInterview,
      feedback,
    });

    await expect(
      getInterviewDetails(interviewId),
    ).resolves.toEqual({
      ...baseInterview,
      feedback,
      hasFeedback: true,
    });

    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: {
        id: interviewId,
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        scheduledAt: true,
        durationMinutes: true,
        notes: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            targetRole: true,
            seniority: true,
          },
        },
        feedback: {
          select: {
            id: true,
            strengths: true,
            improvementAreas: true,
            recommendation: true,
            overallScore: true,
            technicalScore: true,
            communicationScore: true,
            additionalNotes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    expect(mocks.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_details_loaded",
        found: true,
        interviewId,
      }),
      "Interview details loaded.",
    );
  });

  it("returns details without feedback", async () => {
    mocks.findUnique.mockResolvedValue({
      ...baseInterview,
      feedback: null,
    });

    await expect(
      getInterviewDetails(interviewId),
    ).resolves.toEqual({
      ...baseInterview,
      feedback: null,
      hasFeedback: false,
    });
  });

  it("returns null when the interview is missing", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(
      getInterviewDetails(interviewId),
    ).resolves.toBeNull();

    expect(mocks.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_details_loaded",
        found: false,
        interviewId,
      }),
      "Interview details loaded.",
    );
  });

  it("logs failures and throws a safe error", async () => {
    const databaseError = new Error("Database unavailable");

    mocks.findUnique.mockRejectedValue(databaseError);

    await expect(
      getInterviewDetails(interviewId),
    ).rejects.toThrow("Unable to load interview details.");

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "interview_details_failed",
        err: databaseError,
        interviewId,
      },
      "Unable to load interview details.",
    );
  });
});