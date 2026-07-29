import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { SeniorityLevel } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    candidate: {
      findMany: mocks.findMany,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: {
    debug: mocks.debug,
    error: mocks.error,
  },
}));

import { getInterviewFormOptions } from "@/features/interviews/server/get-interview-form-options";

describe("getInterviewFormOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns candidate options ordered by name", async () => {
    const candidates = [
      {
        id: "candidate-1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        seniority: SeniorityLevel.SENIOR,
      },
      {
        id: "candidate-2",
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.com",
        seniority: SeniorityLevel.LEAD,
      },
    ];

    mocks.findMany.mockResolvedValue(candidates);

    await expect(
      getInterviewFormOptions(),
    ).resolves.toEqual(candidates);

    expect(mocks.findMany).toHaveBeenCalledWith({
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        seniority: true,
      },
    });

    expect(mocks.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interview_form_options_loaded",
        totalCandidates: 2,
        durationMs: expect.any(Number),
      }),
      "Interview form options loaded.",
    );
  });

  it("logs failures and throws a safe error", async () => {
    const databaseError = new Error(
      "Database credentials exposed",
    );

    mocks.findMany.mockRejectedValue(databaseError);

    await expect(
      getInterviewFormOptions(),
    ).rejects.toThrow(
      "Unable to load interview form options.",
    );

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "interview_form_options_failed",
        err: databaseError,
      },
      "Unable to load interview form options.",
    );
  });
});