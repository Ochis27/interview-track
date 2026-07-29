import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { interviewsContent } from "@/content/interviews";
import { InterviewType } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    candidate: {
      findUnique: mocks.findUnique,
    },
    interviewSession: {
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

import { createInterview } from "@/features/interviews/server/create-interview";

const validInput = {
  candidateId: "candidate-1",
  title: "Senior frontend interview",
  type: InterviewType.TECHNICAL,
  scheduledAt: "2026-07-30T14:30",
  durationMinutes: 60,
  notes: "Focus on application architecture.",
};

describe("createInterview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation errors for invalid input", async () => {
    const result = await createInterview({
      ...validInput,
      candidateId: "",
      title: "a",
    });

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message:
          interviewsContent.form.errors.validation,
        fieldErrors: expect.objectContaining({
          candidateId: expect.any(Array),
          title: expect.any(Array),
        }),
      }),
    );

    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects a candidate that no longer exists", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const result = await createInterview(validInput);

    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: {
        id: "candidate-1",
      },
      select: {
        id: true,
      },
    });

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.form.errors.candidateMissing,
      fieldErrors: {
        candidateId: [
          interviewsContent.form.errors.candidateMissing,
        ],
      },
    });

    expect(mocks.create).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action: "interview_candidate_missing",
        candidateId: "candidate-1",
      },
      "Unable to schedule interview for missing candidate.",
    );
  });

  it("creates and returns a scheduled interview", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "candidate-1",
    });

    mocks.create.mockResolvedValue({
      id: "interview-1",
    });

    const result = await createInterview(validInput);

    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        candidateId: "candidate-1",
        durationMinutes: 60,
        notes: "Focus on application architecture.",
        scheduledAt: new Date("2026-07-30T14:30"),
        title: "Senior frontend interview",
        type: InterviewType.TECHNICAL,
      },
      select: {
        id: true,
      },
    });

    expect(result).toEqual({
      success: true,
      interviewId: "interview-1",
    });

    expect(mocks.info).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_created",
        candidateId: "candidate-1",
        durationMs: expect.any(Number),
        interviewId: "interview-1",
      }),
      "Interview scheduled.",
    );
  });

  it("returns a safe error when persistence fails", async () => {
    const databaseError = new Error(
      "Sensitive database error",
    );

    mocks.findUnique.mockResolvedValue({
      id: "candidate-1",
    });

    mocks.create.mockRejectedValue(databaseError);

    const result = await createInterview(validInput);

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.form.errors.creationFailed,
    });

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "interview_creation_failed",
        candidateId: "candidate-1",
        err: databaseError,
      },
      "Unable to schedule interview.",
    );
  });
});