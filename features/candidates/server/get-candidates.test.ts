import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  getCandidates,
} from "@/features/candidates/server/get-candidates";
import type {
  CandidateListParams,
} from "@/features/candidates/schemas/candidate-list-params";

const databaseMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}));

const loggerMocks = vi.hoisted(() => ({
  debug: vi.fn(),
  error: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    candidate: {
      findMany: databaseMocks.findMany,
      count: databaseMocks.count,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: loggerMocks,
}));

const defaultParams: CandidateListParams = {
  query: "",
  page: 1,
  pageSize: 10,
  sortBy: "createdAt",
  sortDirection: "desc",
};

const candidateRecord = {
  id: "candidate-1",
  firstName: "Ana",
  lastName: "Popescu",
  email: "ana@example.com",
  currentRole: "Frontend Developer",
  targetRole: "Senior Frontend Developer",
  seniority: "MIDDLE" as const,
  yearsExperience: 4,
  createdAt: new Date(
    "2026-07-20T10:00:00.000Z",
  ),
  _count: {
    interviews: 3,
  },
};

describe("getCandidates", () => {
  beforeEach(() => {
    databaseMocks.findMany.mockReset();
    databaseMocks.count.mockReset();
    loggerMocks.debug.mockReset();
    loggerMocks.error.mockReset();

    databaseMocks.findMany.mockResolvedValue([
      candidateRecord,
    ]);
    databaseMocks.count.mockResolvedValue(1);
  });

  it("returns a paginated candidate list", async () => {
    const result = await getCandidates(
      defaultParams,
    );

    expect(result).toEqual({
      candidates: [
        {
          id: candidateRecord.id,
          firstName: "Ana",
          lastName: "Popescu",
          email: "ana@example.com",
          currentRole: "Frontend Developer",
          targetRole:
            "Senior Frontend Developer",
          seniority: "MIDDLE",
          yearsExperience: 4,
          createdAt:
            candidateRecord.createdAt,
          interviewCount: 3,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      pageCount: 1,
    });

    expect(
      databaseMocks.findMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined,
        orderBy: [
          { createdAt: "desc" },
        ],
        skip: 0,
        take: 10,
      }),
    );

    expect(loggerMocks.debug).toHaveBeenCalled();
  });

  it("applies search and name sorting", async () => {
    await getCandidates({
      ...defaultParams,
      query: "ana",
      page: 2,
      pageSize: 5,
      sortBy: "name",
      sortDirection: "asc",
    });

    expect(
      databaseMocks.findMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: expect.arrayContaining([
            {
              firstName: {
                contains: "ana",
                mode: "insensitive",
              },
            },
          ]),
        },
        orderBy: [
          { lastName: "asc" },
          { firstName: "asc" },
        ],
        skip: 5,
        take: 5,
      }),
    );
  });

  it("supports seniority sorting", async () => {
    await getCandidates({
      ...defaultParams,
      sortBy: "seniority",
      sortDirection: "asc",
    });

    expect(
      databaseMocks.findMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { seniority: "asc" },
          { lastName: "asc" },
        ],
      }),
    );
  });

  it("logs failures and throws a safe error", async () => {
    const databaseError = new Error(
      "Sensitive database error",
    );

    databaseMocks.findMany.mockRejectedValue(
      databaseError,
    );

    await expect(
      getCandidates(defaultParams),
    ).rejects.toThrow(
      "Unable to load candidates.",
    );

    expect(loggerMocks.error).toHaveBeenCalledWith(
      expect.objectContaining({
        action:
          "candidates_list_load_failed",
        err: databaseError,
      }),
      "Failed to load candidate list.",
    );
  });
});