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
  error: vi.fn(),
  feedbackCreate: vi.fn(),
  interviewFindUnique: vi.fn(),
  info: vi.fn(),
  recordAuditEvent: vi.fn(),
  revalidatePath: vi.fn(),
  warn: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    feedback: {
      create: mocks.feedbackCreate,
    },
    interviewSession: {
      findUnique:
        mocks.interviewFindUnique,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: {
    error: mocks.error,
    info: mocks.info,
    warn: mocks.warn,
  },
}));

vi.mock(
  "@/lib/audit/record-audit-event",
  () => ({
    recordAuditEvent: mocks.recordAuditEvent,
  }),
);

const { createFeedback } = await import(
  "@/features/interviews/server/create-feedback"
);

const interviewId = "interview-1";

const validFeedback = {
  strengths:
    "Strong architecture and testing knowledge.",
  improvementAreas:
    "Could explain performance trade-offs more clearly.",
  recommendation: Recommendation.HIRE,
  overallScore: 4,
  technicalScore: 4,
  communicationScore: 3,
  additionalNotes:
    "Good performance during the interview.",
};

describe("createFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.recordAuditEvent.mockResolvedValue(
      undefined,
    );
  });

  it("returns validation errors", async () => {
    const result = await createFeedback(
      interviewId,
      {},
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message:
          interviewsContent.feedbackForm.errors
            .validation,
        fieldErrors: expect.any(Object),
      }),
    );

    expect(
      mocks.interviewFindUnique,
    ).not.toHaveBeenCalled();

    expect(
      mocks.feedbackCreate,
    ).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();
  });

  it("rejects a missing interview", async () => {
    mocks.interviewFindUnique.mockResolvedValue(
      null,
    );

    const result = await createFeedback(
      interviewId,
      validFeedback,
    );

    expect(
      mocks.interviewFindUnique,
    ).toHaveBeenCalledWith({
      where: {
        id: interviewId,
      },
      select: {
        id: true,
        status: true,
        feedback: {
          select: {
            id: true,
          },
        },
      },
    });

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.feedbackForm.errors
          .interviewMissing,
    });

    expect(
      mocks.feedbackCreate,
    ).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action: "feedback_interview_missing",
        interviewId,
      },
      "Unable to create feedback for missing interview.",
    );
  });

  it("rejects an incomplete interview", async () => {
    mocks.interviewFindUnique.mockResolvedValue({
      id: interviewId,
      status: InterviewStatus.SCHEDULED,
      feedback: null,
    });

    const result = await createFeedback(
      interviewId,
      validFeedback,
    );

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.feedbackForm.errors
          .interviewIncomplete,
    });

    expect(
      mocks.feedbackCreate,
    ).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action:
          "feedback_interview_incomplete",
        interviewId,
        status: InterviewStatus.SCHEDULED,
      },
      "Unable to create feedback for incomplete interview.",
    );
  });

  it("rejects duplicate feedback", async () => {
    mocks.interviewFindUnique.mockResolvedValue({
      id: interviewId,
      status: InterviewStatus.COMPLETED,
      feedback: {
        id: "existing-feedback",
      },
    });

    const result = await createFeedback(
      interviewId,
      validFeedback,
    );

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.feedbackForm.errors
          .feedbackExists,
    });

    expect(
      mocks.feedbackCreate,
    ).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action: "feedback_already_exists",
        feedbackId: "existing-feedback",
        interviewId,
      },
      "Feedback already exists for interview.",
    );
  });

  it("creates, audits, and revalidates feedback", async () => {
    mocks.interviewFindUnique.mockResolvedValue({
      id: interviewId,
      status: InterviewStatus.COMPLETED,
      feedback: null,
    });

    mocks.feedbackCreate.mockResolvedValue({
      id: "feedback-1",
    });

    const result = await createFeedback(
      interviewId,
      validFeedback,
    );

    expect(
      mocks.feedbackCreate,
    ).toHaveBeenCalledWith({
      data: {
        additionalNotes:
          validFeedback.additionalNotes,
        communicationScore:
          validFeedback.communicationScore,
        improvementAreas:
          validFeedback.improvementAreas,
        interviewSessionId: interviewId,
        overallScore:
          validFeedback.overallScore,
        recommendation:
          validFeedback.recommendation,
        strengths: validFeedback.strengths,
        technicalScore:
          validFeedback.technicalScore,
      },
      select: {
        id: true,
      },
    });

    expect(
      mocks.recordAuditEvent,
    ).toHaveBeenCalledWith({
      action: "FEEDBACK_SUBMITTED",
      entityType: "Feedback",
      entityId: "feedback-1",
      message: "Interview feedback submitted.",
      metadata: {
        interviewId,
        overallScore:
          validFeedback.overallScore,
        recommendation:
          validFeedback.recommendation,
      },
    });

    expect(
      mocks.revalidatePath,
    ).toHaveBeenNthCalledWith(1, "/");

    expect(
      mocks.revalidatePath,
    ).toHaveBeenNthCalledWith(
      2,
      "/interviews",
    );

    expect(
      mocks.revalidatePath,
    ).toHaveBeenNthCalledWith(
      3,
      `/interviews/${interviewId}`,
    );

    expect(
      mocks.revalidatePath,
    ).toHaveBeenNthCalledWith(
      4,
      "/reports",
    );

    expect(mocks.info).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "feedback_created",
        durationMs: expect.any(Number),
        feedbackId: "feedback-1",
        interviewId,
      }),
      "Interview feedback created.",
    );

    expect(result).toEqual({
      success: true,
      feedbackId: "feedback-1",
    });
  });

  it("returns a safe persistence error", async () => {
    const databaseError = new Error(
      "Feedback creation failed",
    );

    mocks.interviewFindUnique.mockResolvedValue({
      id: interviewId,
      status: InterviewStatus.COMPLETED,
      feedback: null,
    });

    mocks.feedbackCreate.mockRejectedValue(
      databaseError,
    );

    const result = await createFeedback(
      interviewId,
      validFeedback,
    );

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.feedbackForm.errors
          .creationFailed,
    });

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(
      mocks.revalidatePath,
    ).not.toHaveBeenCalled();

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "feedback_creation_failed",
        err: databaseError,
        interviewId,
      },
      "Unable to create interview feedback.",
    );
  });
});