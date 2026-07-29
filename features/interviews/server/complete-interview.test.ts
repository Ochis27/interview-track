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
} from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  error: vi.fn(),
  findUnique: vi.fn(),
  info: vi.fn(),
  recordAuditEvent: vi.fn(),
  revalidatePath: vi.fn(),
  update: vi.fn(),
  warn: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    interviewSession: {
      findUnique: mocks.findUnique,
      update: mocks.update,
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

const { completeInterview } = await import(
  "@/features/interviews/server/complete-interview"
);

const interviewId = "interview-1";

describe("completeInterview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.recordAuditEvent.mockResolvedValue(
      undefined,
    );
  });

  it("rejects an interview that no longer exists", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const result = await completeInterview(
      interviewId,
    );

    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: {
        id: interviewId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.details.errors.notFound,
    });

    expect(mocks.update).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action: "interview_completion_missing",
        interviewId,
      },
      "Unable to complete missing interview.",
    );
  });

  it("returns success for an already completed interview", async () => {
    mocks.findUnique.mockResolvedValue({
      id: interviewId,
      status: InterviewStatus.COMPLETED,
    });

    const result = await completeInterview(
      interviewId,
    );

    expect(result).toEqual({
      success: true,
    });

    expect(mocks.update).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.info).toHaveBeenCalledWith(
      {
        action: "interview_already_completed",
        interviewId,
      },
      "Interview was already completed.",
    );
  });

  it("rejects a cancelled interview", async () => {
    mocks.findUnique.mockResolvedValue({
      id: interviewId,
      status: InterviewStatus.CANCELLED,
    });

    const result = await completeInterview(
      interviewId,
    );

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.details.errors
          .cannotComplete,
    });

    expect(mocks.update).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action:
          "interview_completion_rejected",
        interviewId,
        status: InterviewStatus.CANCELLED,
      },
      "Cancelled interview cannot be completed.",
    );
  });

  it("completes, audits, and revalidates an interview", async () => {
    mocks.findUnique.mockResolvedValue({
      id: interviewId,
      status: InterviewStatus.SCHEDULED,
    });

    mocks.update.mockResolvedValue({
      id: interviewId,
    });

    const result = await completeInterview(
      interviewId,
    );

    expect(mocks.update).toHaveBeenCalledWith({
      where: {
        id: interviewId,
      },
      data: {
        completedAt: expect.any(Date),
        status: InterviewStatus.COMPLETED,
      },
    });

    expect(
      mocks.recordAuditEvent,
    ).toHaveBeenCalledWith({
      action: "INTERVIEW_COMPLETED",
      entityType: "InterviewSession",
      entityId: interviewId,
      message: "Interview session completed.",
      metadata: {
        status: InterviewStatus.COMPLETED,
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

    expect(mocks.info).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_completed",
        durationMs: expect.any(Number),
        interviewId,
      }),
      "Interview completed.",
    );

    expect(result).toEqual({
      success: true,
    });
  });

  it("returns a safe error when completion fails", async () => {
    const databaseError = new Error(
      "Update failed",
    );

    mocks.findUnique.mockResolvedValue({
      id: interviewId,
      status: InterviewStatus.IN_PROGRESS,
    });

    mocks.update.mockRejectedValue(databaseError);

    const result = await completeInterview(
      interviewId,
    );

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.details.errors
          .completionFailed,
    });

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(
      mocks.revalidatePath,
    ).not.toHaveBeenCalled();

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "interview_completion_failed",
        err: databaseError,
        interviewId,
      },
      "Unable to complete interview.",
    );
  });
});