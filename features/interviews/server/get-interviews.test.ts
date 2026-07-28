import { beforeEach, describe, expect, it, vi } from "vitest";

import type { InterviewListParams } from "@/features/interviews/schemas/interview-list-params";
import { getInterviews } from "@/features/interviews/server/get-interviews";
import {
  InterviewStatus,
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";

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
    interviewSession: {
      findMany: databaseMocks.findMany,
      count: databaseMocks.count,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: loggerMocks,
}));

const defaultParams: InterviewListParams = {
  query: "",
  status: "ALL",
  page: 1,
  pageSize: 10,
  sortBy: "scheduledAt",
  sortDirection: "desc",
};

const scheduledAt = new Date("2026-08-01T10:00:00.000Z");

const interviewRecord = {
  id: "interview-1",
  title: "Frontend technical interview",
  type: InterviewType.TECHNICAL,
  status: InterviewStatus.SCHEDULED,
  scheduledAt,
  durationMinutes: 60,
  completedAt: null,
  candidate: {
    id: "candidate-1",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    seniority: SeniorityLevel.MIDDLE,
  },
  feedback: {
    id: "feedback-1",
  },
};

describe("getInterviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    databaseMocks.findMany.mockResolvedValue([
      interviewRecord,
      {
        ...interviewRecord,
        id: "interview-2",
        feedback: null,
      },
    ]);

    databaseMocks.count.mockResolvedValue(2);
  });

  it("returns a paginated interview list", async () => {
    const result = await getInterviews(defaultParams);

    expect(result.interviews).toHaveLength(2);
    expect(result.interviews[0]).toEqual({
      ...interviewRecord,
      feedback: undefined,
      hasFeedback: true,
    });
    expect(result.interviews[1]?.hasFeedback).toBe(false);

    expect(result).toMatchObject({
      total: 2,
      page: 1,
      pageSize: 10,
      pageCount: 1,
    });

    expect(databaseMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined,
        orderBy: [{ scheduledAt: "desc" }],
        skip: 0,
        take: 10,
      }),
    );

    expect(loggerMocks.debug).toHaveBeenCalledOnce();
  });

  it("applies search, status filtering, and title sorting", async () => {
    await getInterviews({
      ...defaultParams,
      query: "Alice",
      status: InterviewStatus.COMPLETED,
      page: 2,
      pageSize: 5,
      sortBy: "title",
      sortDirection: "asc",
    });

    expect(databaseMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: expect.arrayContaining([
            {
              title: {
                contains: "Alice",
                mode: "insensitive",
              },
            },
          ]),
          status: InterviewStatus.COMPLETED,
        },
        orderBy: [
          { title: "asc" },
          { scheduledAt: "desc" },
        ],
        skip: 5,
        take: 5,
      }),
    );
  });

  it("supports status sorting", async () => {
    await getInterviews({
      ...defaultParams,
      sortBy: "status",
      sortDirection: "asc",
    });

    expect(databaseMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { status: "asc" },
          { scheduledAt: "desc" },
        ],
      }),
    );
  });

  it("supports creation date sorting", async () => {
    await getInterviews({
      ...defaultParams,
      sortBy: "createdAt",
      sortDirection: "asc",
    });

    expect(databaseMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: "asc" }],
      }),
    );
  });

  it("logs failures and throws a safe error", async () => {
    const databaseError = new Error(
      "Sensitive database connection error",
    );

    databaseMocks.findMany.mockRejectedValue(databaseError);

    await expect(
      getInterviews(defaultParams),
    ).rejects.toThrow("Unable to load interviews.");

    expect(loggerMocks.error).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "interviews_list_load_failed",
        err: databaseError,
      }),
      "Failed to load interview list.",
    );
  });

  it("filters by status without a search query", async () => {
  await getInterviews({
    ...defaultParams,
    status: InterviewStatus.CANCELLED,
  });

  expect(databaseMocks.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        status: InterviewStatus.CANCELLED,
      },
      orderBy: [{ scheduledAt: "desc" }],
    }),
  );

  expect(databaseMocks.count).toHaveBeenCalledWith({
    where: {
      status: InterviewStatus.CANCELLED,
    },
  });
});
});