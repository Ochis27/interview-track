import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { interviewsContent } from "@/content/interviews";
import {
  InterviewType,
} from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  candidateFindUnique: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  interviewCreate: vi.fn(),
  recordAuditEvent: vi.fn(),
  warn: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    candidate: {
      findUnique: mocks.candidateFindUnique,
    },
    interviewSession: {
      create: mocks.interviewCreate,
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

const { createInterview } = await import(
  "@/features/interviews/server/create-interview"
);

const scheduledAtInput = "2026-08-01T09:30";
const scheduledAtDate = new Date(scheduledAtInput);

const validInterview = {
  candidateId:
    "11111111-1111-4111-8111-111111111111",
  title: "Senior frontend interview",
  type: InterviewType.TECHNICAL,
  scheduledAt: scheduledAtInput,
  durationMinutes: 60,
  notes: "Focus on architecture and testing.",
};

describe("createInterview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.recordAuditEvent.mockResolvedValue(
      undefined,
    );
  });

  it("returns validation errors for invalid input", async () => {
    const result = await createInterview({});

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message:
          interviewsContent.form.errors.validation,
        fieldErrors: expect.any(Object),
      }),
    );

    expect(
      mocks.candidateFindUnique,
    ).not.toHaveBeenCalled();

    expect(
      mocks.interviewCreate,
    ).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();
  });

  it("rejects a candidate that no longer exists", async () => {
    mocks.candidateFindUnique.mockResolvedValue(
      null,
    );

    const result = await createInterview(
      validInterview,
    );

    expect(
      mocks.candidateFindUnique,
    ).toHaveBeenCalledWith({
      where: {
        id: validInterview.candidateId,
      },
      select: {
        id: true,
      },
    });

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.form.errors
          .candidateMissing,
      fieldErrors: {
        candidateId: [
          interviewsContent.form.errors
            .candidateMissing,
        ],
      },
    });

    expect(
      mocks.interviewCreate,
    ).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action: "interview_candidate_missing",
        candidateId:
          validInterview.candidateId,
      },
      "Unable to schedule interview for missing candidate.",
    );
  });

  it("creates, audits, and returns a scheduled interview", async () => {
    mocks.candidateFindUnique.mockResolvedValue({
      id: validInterview.candidateId,
    });

    mocks.interviewCreate.mockResolvedValue({
      id: "interview-1",
    });

    const result = await createInterview(
      validInterview,
    );

    expect(mocks.interviewCreate).toHaveBeenCalledWith({
      data: {
        candidateId:
          validInterview.candidateId,
        durationMinutes:
          validInterview.durationMinutes,
        notes: validInterview.notes,
        scheduledAt: scheduledAtDate,
        title: validInterview.title,
        type: validInterview.type,
      },
      select: {
        id: true,
      },
    });

    expect(
      mocks.recordAuditEvent,
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.recordAuditEvent,
    ).toHaveBeenCalledWith({
      action: "INTERVIEW_CREATED",
      entityType: "InterviewSession",
      entityId: "interview-1",
      message: "Interview session created.",
      metadata: {
        candidateId:
          validInterview.candidateId,
        durationMinutes:
          validInterview.durationMinutes,
        scheduledAt:
          scheduledAtDate.toISOString(),
        title: validInterview.title,
        type: validInterview.type,
      },
    });

    expect(mocks.info).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_created",
        candidateId:
          validInterview.candidateId,
        durationMs: expect.any(Number),
        interviewId: "interview-1",
      }),
      "Interview scheduled.",
    );

    expect(result).toEqual({
      success: true,
      interviewId: "interview-1",
    });
  });

  it("returns a safe error when candidate lookup fails", async () => {
    const databaseError = new Error(
      "Candidate lookup failed",
    );

    mocks.candidateFindUnique.mockRejectedValue(
      databaseError,
    );

    const result = await createInterview(
      validInterview,
    );

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.form.errors
          .creationFailed,
    });

    expect(
      mocks.interviewCreate,
    ).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "interview_creation_failed",
        candidateId:
          validInterview.candidateId,
        err: databaseError,
      },
      "Unable to schedule interview.",
    );
  });

  it("returns a safe error when persistence fails", async () => {
    const databaseError = new Error(
      "Interview creation failed",
    );

    mocks.candidateFindUnique.mockResolvedValue({
      id: validInterview.candidateId,
    });

    mocks.interviewCreate.mockRejectedValue(
      databaseError,
    );

    const result = await createInterview(
      validInterview,
    );

    expect(result).toEqual({
      success: false,
      message:
        interviewsContent.form.errors
          .creationFailed,
    });

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "interview_creation_failed",
        candidateId:
          validInterview.candidateId,
        err: databaseError,
      },
      "Unable to schedule interview.",
    );
  });
});