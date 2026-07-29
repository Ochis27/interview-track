import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { interviewsContent } from "@/content/interviews";
import {
  InterviewStatus,
  Recommendation,
} from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  revalidatePath: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    interviewSession: {
      findUnique: mocks.findUnique,
    },
    feedback: {
      create: mocks.create,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: {
    info: mocks.info,
    warn: mocks.warn,
    error: mocks.error,
  },
}));

import { createFeedback } from "@/features/interviews/server/create-feedback";

const validInput = {
  strengths: "Strong technical knowledge.",
  improvementAreas:
    "Could communicate trade-offs more clearly.",
  recommendation: Recommendation.HIRE,
  overallScore: 4,
  technicalScore: 5,
  communicationScore: 3,
  additionalNotes: "Good overall interview.",
};

describe("createFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation errors", async () => {
    const result = await createFeedback(
      "interview-1",
      {
        ...validInput,
        strengths: "",
        overallScore: 6,
      },
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message:
          interviewsContent.feedbackForm.errors
            .validation,
        fieldErrors: expect.objectContaining({
          strengths: expect.any(Array),
          overallScore: expect.any(Array),
        }),
      }),
    );

    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects a missing interview", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(
      createFeedback("missing-interview", validInput),
    ).resolves.toEqual({
      success: false,
      message:
        interviewsContent.feedbackForm.errors
          .interviewMissing,
    });

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects an incomplete interview", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "interview-1",
      status: InterviewStatus.SCHEDULED,
      feedback: null,
    });

    await expect(
      createFeedback("interview-1", validInput),
    ).resolves.toEqual({
      success: false,
      message:
        interviewsContent.feedbackForm.errors
          .interviewIncomplete,
    });

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action: "feedback_interview_incomplete",
        interviewId: "interview-1",
        status: InterviewStatus.SCHEDULED,
      },
      "Unable to create feedback for incomplete interview.",
    );

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects duplicate feedback", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "interview-1",
      status: InterviewStatus.COMPLETED,
      feedback: {
        id: "feedback-1",
      },
    });

    await expect(
      createFeedback("interview-1", validInput),
    ).resolves.toEqual({
      success: false,
      message:
        interviewsContent.feedbackForm.errors
          .feedbackExists,
    });

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates feedback and revalidates pages", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "interview-1",
      status: InterviewStatus.COMPLETED,
      feedback: null,
    });

    mocks.create.mockResolvedValue({
      id: "feedback-1",
    });

    const result = await createFeedback(
      "interview-1",
      validInput,
    );

    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        additionalNotes: "Good overall interview.",
        communicationScore: 3,
        improvementAreas:
          "Could communicate trade-offs more clearly.",
        interviewSessionId: "interview-1",
        overallScore: 4,
        recommendation: Recommendation.HIRE,
        strengths: "Strong technical knowledge.",
        technicalScore: 5,
      },
      select: {
        id: true,
      },
    });

    expect(result).toEqual({
      success: true,
      feedbackId: "feedback-1",
    });

    expect(mocks.info).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "feedback_created",
        durationMs: expect.any(Number),
        feedbackId: "feedback-1",
        interviewId: "interview-1",
      }),
      "Interview feedback created.",
    );

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/interviews",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/interviews/interview-1",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/reports",
    );
  });

  it("returns a safe persistence error", async () => {
    const databaseError = new Error(
      "Sensitive database error",
    );

    mocks.findUnique.mockRejectedValue(databaseError);

    await expect(
      createFeedback("interview-1", validInput),
    ).resolves.toEqual({
      success: false,
      message:
        interviewsContent.feedbackForm.errors
          .creationFailed,
    });

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "feedback_creation_failed",
        err: databaseError,
        interviewId: "interview-1",
      },
      "Unable to create interview feedback.",
    );
  });
});