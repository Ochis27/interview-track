import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getDashboardData } from "@/features/dashboard/server/get-dashboard-data";

const databaseMocks = vi.hoisted(() => ({
  candidateCount: vi.fn(),
  interviewCount: vi.fn(),
  feedbackCount: vi.fn(),
  interviewFindMany: vi.fn(),
}));

const loggerMocks = vi.hoisted(() => ({
  debug: vi.fn(),
  error: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    candidate: {
      count: databaseMocks.candidateCount,
    },
    interviewSession: {
      count: databaseMocks.interviewCount,
      findMany: databaseMocks.interviewFindMany,
    },
    feedback: {
      count: databaseMocks.feedbackCount,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: loggerMocks,
}));

const currentDate = new Date(
  "2026-07-28T18:00:00.000Z",
);

const upcomingInterviews = [
  {
    id: "interview-1",
    title: "Frontend technical interview",
    type: "TECHNICAL" as const,
    scheduledAt: new Date(
      "2026-07-29T10:00:00.000Z",
    ),
    durationMinutes: 60,
    candidate: {
      firstName: "Ana",
      lastName: "Popescu",
      seniority: "MIDDLE" as const,
    },
  },
];

describe("getDashboardData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(currentDate);

    databaseMocks.candidateCount.mockReset();
    databaseMocks.interviewCount.mockReset();
    databaseMocks.feedbackCount.mockReset();
    databaseMocks.interviewFindMany.mockReset();

    loggerMocks.debug.mockReset();
    loggerMocks.error.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns dashboard statistics and upcoming interviews", async () => {
    databaseMocks.candidateCount.mockResolvedValue(4);

    databaseMocks.interviewCount
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(3);

    databaseMocks.feedbackCount.mockResolvedValue(2);

    databaseMocks.interviewFindMany.mockResolvedValue(
      upcomingInterviews,
    );

    const result = await getDashboardData();

    expect(result).toEqual({
      summary: {
        totalCandidates: 4,
        totalInterviews: 6,
        scheduledInterviews: 3,
        completedFeedback: 2,
      },
      upcomingInterviews,
    });

    expect(
      databaseMocks.interviewCount,
    ).toHaveBeenCalledTimes(2);

    expect(
      databaseMocks.interviewFindMany,
    ).toHaveBeenCalledWith({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          gte: currentDate,
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        scheduledAt: true,
        durationMinutes: true,
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            seniority: true,
          },
        },
      },
    });

    expect(loggerMocks.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "dashboard_data_loaded",
      }),
      "Dashboard data loaded.",
    );

    expect(
      loggerMocks.error,
    ).not.toHaveBeenCalled();
  });

  it("logs database errors and throws a safe message", async () => {
    const databaseError = new Error(
      "Sensitive database connection error",
    );

    databaseMocks.candidateCount.mockRejectedValue(
      databaseError,
    );

    await expect(
      getDashboardData(),
    ).rejects.toThrow(
      "Unable to load dashboard data.",
    );

    expect(loggerMocks.error).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "dashboard_data_load_failed",
        err: databaseError,
      }),
      "Failed to load dashboard data.",
    );

    expect(
      loggerMocks.debug,
    ).not.toHaveBeenCalled();
  });
});