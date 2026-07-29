import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { interviewsContent } from "@/content/interviews";
import { InterviewStatus } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
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
      update: mocks.update,
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

import { completeInterview } from "@/features/interviews/server/complete-interview";

describe("completeInterview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an interview that no longer exists", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(
      completeInterview("missing-interview"),
    ).resolves.toEqual({
      success: false,
      message:
        interviewsContent.details.errors.notFound,
    });

    expect(mocks.update).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action: "interview_completion_missing",
        interviewId: "missing-interview",
      },
      "Unable to complete missing interview.",
    );
  });

  it("returns success for an already completed interview", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "interview-1",
      status: InterviewStatus.COMPLETED,
    });

    await expect(
      completeInterview("interview-1"),
    ).resolves.toEqual({
      success: true,
    });

    expect(mocks.update).not.toHaveBeenCalled();

    expect(mocks.info).toHaveBeenCalledWith(
      {
        action: "interview_already_completed",
        interviewId: "interview-1",
      },
      "Interview was already completed.",
    );
  });

  it("rejects a cancelled interview", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "interview-1",
      status: InterviewStatus.CANCELLED,
    });

    await expect(
      completeInterview("interview-1"),
    ).resolves.toEqual({
      success: false,
      message:
        interviewsContent.details.errors.cannotComplete,
    });

    expect(mocks.update).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action: "interview_completion_rejected",
        interviewId: "interview-1",
        status: InterviewStatus.CANCELLED,
      },
      "Cancelled interview cannot be completed.",
    );
  });

  it("completes and revalidates an interview", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "interview-1",
      status: InterviewStatus.SCHEDULED,
    });

    mocks.update.mockResolvedValue({
      id: "interview-1",
    });

    const result = await completeInterview(
      "interview-1",
    );

    expect(result).toEqual({
      success: true,
    });

    expect(mocks.update).toHaveBeenCalledWith({
      where: {
        id: "interview-1",
      },
      data: {
        completedAt: expect.any(Date),
        status: InterviewStatus.COMPLETED,
      },
    });

    expect(mocks.info).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_completed",
        durationMs: expect.any(Number),
        interviewId: "interview-1",
      }),
      "Interview completed.",
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
  });

  it("returns a safe error when completion fails", async () => {
    const databaseError = new Error(
      "Sensitive database error",
    );

    mocks.findUnique.mockRejectedValue(databaseError);

    await expect(
      completeInterview("interview-1"),
    ).resolves.toEqual({
      success: false,
      message:
        interviewsContent.details.errors
          .completionFailed,
    });

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "interview_completion_failed",
        err: databaseError,
        interviewId: "interview-1",
      },
      "Unable to complete interview.",
    );
  });
});