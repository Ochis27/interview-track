import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { candidatesContent } from "@/content/candidates";
import {
  SeniorityLevel,
} from "@/generated/prisma/enums";
import {
  auditActions,
  auditEntityTypes,
} from "@/lib/audit/audit-events";

const mocks = vi.hoisted(() => ({
  candidateCreate: vi.fn(),
  error: vi.fn(),
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
    candidate: {
      create: mocks.candidateCreate,
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

import { createCandidate } from "@/features/candidates/server/create-candidate";

const validCandidate = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "+40722111222",
  currentRole: "Frontend Engineer",
  targetRole: "Senior Frontend Engineer",
  seniority: SeniorityLevel.SENIOR,
  yearsExperience: 5,
  notes: "Strong TypeScript experience.",
};

describe("createCandidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.recordAuditEvent.mockResolvedValue(
      undefined,
    );
  });

  it("returns validation errors for invalid input", async () => {
    const result = await createCandidate({});

    expect(result.success).toBe(false);

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message:
          candidatesContent.form.feedback
            .validationError,
        fieldErrors: expect.any(Object),
      }),
    );

    expect(
      mocks.candidateCreate,
    ).not.toHaveBeenCalled();

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        action:
          "candidate_create_validation_failed",
        fields: expect.any(Array),
      }),
      "Candidate creation validation failed.",
    );
  });

  it("creates, audits, and returns a candidate", async () => {
    mocks.candidateCreate.mockResolvedValue({
      id: "candidate-1",
    });

    const result = await createCandidate(
      validCandidate,
    );

    expect(mocks.candidateCreate).toHaveBeenCalledWith({
      data: validCandidate,
      select: {
        id: true,
      },
    });

    expect(
      mocks.recordAuditEvent,
    ).toHaveBeenCalledWith({
      action: auditActions.candidateCreated,
      entityType: auditEntityTypes.candidate,
      entityId: "candidate-1",
      message: "Candidate profile created.",
      metadata: {
        email: validCandidate.email,
        seniority: validCandidate.seniority,
        targetRole: validCandidate.targetRole,
      },
    });

    expect(
      mocks.revalidatePath,
    ).toHaveBeenCalledWith("/candidates");

    expect(mocks.info).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "candidate_created",
        candidateId: "candidate-1",
        durationMs: expect.any(Number),
      }),
      "Candidate created successfully.",
    );

    expect(result).toEqual({
      success: true,
      candidateId: "candidate-1",
    });
  });

  it("returns an email error for duplicate candidates", async () => {
    mocks.candidateCreate.mockRejectedValue({
      code: "P2002",
    });

    const result = await createCandidate(
      validCandidate,
    );

    expect(result).toEqual({
      success: false,
      message:
        candidatesContent.form.feedback
          .duplicateEmail,
      fieldErrors: {
        email: [
          candidatesContent.form.feedback
            .duplicateEmail,
        ],
      },
    });

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.warn).toHaveBeenCalledWith(
      {
        action:
          "candidate_create_duplicate_email",
      },
      "Candidate creation rejected because the email already exists.",
    );
  });

  it("returns a safe error for persistence failures", async () => {
    const databaseError = new Error(
      "Database unavailable",
    );

    mocks.candidateCreate.mockRejectedValue(
      databaseError,
    );

    const result = await createCandidate(
      validCandidate,
    );

    expect(result).toEqual({
      success: false,
      message:
        candidatesContent.form.feedback.createError,
    });

    expect(
      mocks.recordAuditEvent,
    ).not.toHaveBeenCalled();

    expect(mocks.error).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "candidate_create_failed",
        durationMs: expect.any(Number),
        err: databaseError,
      }),
      "Candidate creation failed.",
    );
  });

  it("handles primitive persistence errors safely", async () => {
    mocks.candidateCreate.mockRejectedValue(
      "connection-failed",
    );

    await expect(
      createCandidate(validCandidate),
    ).resolves.toEqual({
      success: false,
      message:
        candidatesContent.form.feedback.createError,
    });

    expect(mocks.error).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "candidate_create_failed",
        err: "connection-failed",
      }),
      "Candidate creation failed.",
    );
  });
});