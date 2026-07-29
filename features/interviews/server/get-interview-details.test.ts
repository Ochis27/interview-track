import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  InterviewStatus,
  InterviewType,
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

const interview = {
  id: "interview-1",
  title: "Senior frontend interview",
  type: InterviewType.TECHNICAL,
  status: InterviewStatus.SCHEDULED,
  scheduledAt: new Date("2026-08-01T09:30:00.000Z"),
  durationMinutes: 60,
  notes: "Focus on architecture.",
  completedAt: null,
  createdAt: new Date("2026-07-29T08:00:00.000Z"),
  updatedAt: new Date("2026-07-29T08:00:00.000Z"),
  candidate: {
    id: "candidate-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    targetRole: "Senior Frontend Engineer",
    seniority: SeniorityLevel.SENIOR,
  },
};

describe("getInterviewDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns interview details with feedback", async () => {
    mocks.findUnique.mockResolvedValue({
      ...interview,
      feedback: {
        id: "feedback-1",
      },
    });

    const result = await getInterviewDetails(
      "interview-1",
    );

    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: {
        id: "interview-1",
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
          },
        },
      },
    });

    expect(result).toEqual({
      ...interview,
      hasFeedback: true,
    });

    expect(mocks.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_details_loaded",
        durationMs: expect.any(Number),
        found: true,
        interviewId: "interview-1",
      }),
      "Interview details loaded.",
    );
  });

  it("returns details without feedback", async () => {
    mocks.findUnique.mockResolvedValue({
      ...interview,
      feedback: null,
    });

    await expect(
      getInterviewDetails("interview-1"),
    ).resolves.toEqual({
      ...interview,
      hasFeedback: false,
    });
  });

  it("returns null when the interview is missing", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(
      getInterviewDetails("missing-interview"),
    ).resolves.toBeNull();

    expect(mocks.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_details_loaded",
        found: false,
        interviewId: "missing-interview",
      }),
      "Interview details loaded.",
    );
  });

  it("logs failures and throws a safe error", async () => {
    const databaseError = new Error(
      "Sensitive database error",
    );

    mocks.findUnique.mockRejectedValue(databaseError);

    await expect(
      getInterviewDetails("interview-1"),
    ).rejects.toThrow(
      "Unable to load interview details.",
    );

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "interview_details_failed",
        err: databaseError,
        interviewId: "interview-1",
      },
      "Unable to load interview details.",
    );
  });
});