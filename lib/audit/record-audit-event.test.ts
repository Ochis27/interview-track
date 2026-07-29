import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  AuditLevel,
} from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    auditLog: {
      create: mocks.create,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: {
    debug: mocks.debug,
    error: mocks.error,
  },
}));

import { recordAuditEvent } from "@/lib/audit/record-audit-event";

describe("recordAuditEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records a complete audit event", async () => {
    mocks.create.mockResolvedValue({
      id: "audit-1",
    });

    await recordAuditEvent({
      action: "CANDIDATE_CREATED",
      entityType: "Candidate",
      entityId: "candidate-1",
      message: "Candidate profile created.",
      level: AuditLevel.WARNING,
      metadata: {
        email: "ada@example.com",
        targetRole: "Frontend Engineer",
      },
      ipAddress: "127.0.0.1",
      userId: "user-1",
    });

    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        action: "CANDIDATE_CREATED",
        entityType: "Candidate",
        entityId: "candidate-1",
        message: "Candidate profile created.",
        level: AuditLevel.WARNING,
        metadata: {
          email: "ada@example.com",
          targetRole: "Frontend Engineer",
        },
        ipAddress: "127.0.0.1",
        userId: "user-1",
      },
      select: {
        id: true,
      },
    });

    expect(mocks.debug).toHaveBeenCalledWith(
      {
        action: "audit_event_recorded",
        auditAction: "CANDIDATE_CREATED",
        auditLogId: "audit-1",
        entityId: "candidate-1",
        entityType: "Candidate",
      },
      "Audit event recorded.",
    );
  });

  it("applies safe defaults to optional values", async () => {
    mocks.create.mockResolvedValue({
      id: "audit-2",
    });

    await recordAuditEvent({
      action: "SYSTEM_EVENT",
      entityType: "System",
      message: "System event recorded.",
    });

    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        action: "SYSTEM_EVENT",
        entityType: "System",
        entityId: null,
        message: "System event recorded.",
        level: AuditLevel.INFO,
        metadata: undefined,
        ipAddress: null,
        userId: null,
      },
      select: {
        id: true,
      },
    });

    expect(mocks.debug).toHaveBeenCalledWith(
      {
        action: "audit_event_recorded",
        auditAction: "SYSTEM_EVENT",
        auditLogId: "audit-2",
        entityId: null,
        entityType: "System",
      },
      "Audit event recorded.",
    );
  });

  it("logs persistence failures without rejecting", async () => {
    const databaseError = new Error(
      "Database unavailable",
    );

    mocks.create.mockRejectedValue(databaseError);

    await expect(
      recordAuditEvent({
        action: "FEEDBACK_SUBMITTED",
        entityType: "Feedback",
        entityId: "feedback-1",
        message: "Interview feedback submitted.",
      }),
    ).resolves.toBeUndefined();

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "audit_event_failed",
        auditAction: "FEEDBACK_SUBMITTED",
        entityId: "feedback-1",
        entityType: "Feedback",
        err: databaseError,
      },
      "Unable to record audit event.",
    );

    expect(mocks.debug).not.toHaveBeenCalled();
  });
});