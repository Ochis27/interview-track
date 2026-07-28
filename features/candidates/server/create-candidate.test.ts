import { beforeEach, describe, expect, it, vi } from "vitest";

import { candidatesContent } from "@/content/candidates";
import { createCandidate } from "@/features/candidates/server/create-candidate";
import { SeniorityLevel } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  candidateCreate: vi.fn(),
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
    candidate: {
      create: mocks.candidateCreate,
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

const validInput = {
  firstName: "Alice",
  lastName: "Johnson",
  email: "alice@example.com",
  phone: "",
  currentRole: "Frontend Developer",
  targetRole: "Senior Engineer",
  seniority: SeniorityLevel.MIDDLE,
  yearsExperience: 5,
  notes: "",
};

describe("createCandidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns field errors when validation fails", async () => {
    const result = await createCandidate({
      ...validInput,
      firstName: "",
      email: "invalid-email",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected candidate creation to fail.");
    }

    expect(result.message).toBe(
      candidatesContent.form.feedback.validationError,
    );
    expect(result.fieldErrors?.firstName).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
    expect(mocks.candidateCreate).not.toHaveBeenCalled();
    expect(mocks.warn).toHaveBeenCalledOnce();
  });

  it("creates a candidate and revalidates the list", async () => {
    mocks.candidateCreate.mockResolvedValue({
      id: "candidate-1",
    });

    const result = await createCandidate(validInput);

    expect(result).toEqual({
      success: true,
      candidateId: "candidate-1",
    });

    expect(mocks.candidateCreate).toHaveBeenCalledWith({
      data: {
        ...validInput,
        phone: null,
        notes: null,
      },
      select: {
        id: true,
      },
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/candidates",
    );
    expect(mocks.info).toHaveBeenCalledOnce();
  });

  it("returns an email error for duplicate candidates", async () => {
    mocks.candidateCreate.mockRejectedValue({
      code: "P2002",
    });

    const result = await createCandidate(validInput);

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected duplicate creation to fail.");
    }

    expect(result.message).toBe(
      candidatesContent.form.feedback.duplicateEmail,
    );
    expect(result.fieldErrors?.email).toEqual([
      candidatesContent.form.feedback.duplicateEmail,
    ]);
    expect(mocks.warn).toHaveBeenCalledOnce();
    expect(mocks.error).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    new Error("Database unavailable"),
    "unknown database failure",
  ])("handles an unexpected database error", async (error) => {
    mocks.candidateCreate.mockRejectedValue(error);

    const result = await createCandidate(validInput);

    expect(result).toEqual({
      success: false,
      message: candidatesContent.form.feedback.createError,
    });

    expect(mocks.error).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});