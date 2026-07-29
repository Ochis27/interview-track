import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  InterviewStatus,
  InterviewType,
  Recommendation,
} from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  interviewCount: vi.fn(),
  interviewGroupBy: vi.fn(),
  feedbackCount: vi.fn(),
  feedbackAggregate: vi.fn(),
  feedbackGroupBy: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    interviewSession: {
      count: mocks.interviewCount,
      groupBy: mocks.interviewGroupBy,
    },
    feedback: {
      count: mocks.feedbackCount,
      aggregate: mocks.feedbackAggregate,
      groupBy: mocks.feedbackGroupBy,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: {
    debug: mocks.debug,
    error: mocks.error,
  },
}));

import { getReportsData } from "@/features/reports/server/get-reports-data";

describe("getReportsData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns normalized report data", async () => {
    mocks.interviewCount
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4);

    mocks.feedbackCount.mockResolvedValue(3);

    mocks.feedbackAggregate.mockResolvedValue({
      _avg: {
        overallScore: 4.33,
        technicalScore: 4.66,
        communicationScore: 3.66,
      },
    });

    mocks.interviewGroupBy
      .mockResolvedValueOnce([
        {
          status: InterviewStatus.SCHEDULED,
          _count: {
            _all: 3,
          },
        },
        {
          status: InterviewStatus.COMPLETED,
          _count: {
            _all: 4,
          },
        },
        {
          status: InterviewStatus.CANCELLED,
          _count: {
            _all: 1,
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          type: InterviewType.TECHNICAL,
          _count: {
            _all: 5,
          },
        },
        {
          type: InterviewType.CODING,
          _count: {
            _all: 3,
          },
        },
      ]);

    mocks.feedbackGroupBy.mockResolvedValue([
      {
        recommendation: Recommendation.STRONG_HIRE,
        _count: {
          _all: 2,
        },
      },
      {
        recommendation:
          Recommendation.CONTINUE_PRACTICE,
        _count: {
          _all: 1,
        },
      },
    ]);

    await expect(getReportsData()).resolves.toEqual({
      summary: {
        totalInterviews: 10,
        completedInterviews: 4,
        submittedFeedback: 3,
        completionRate: 40,
        feedbackCoverage: 75,
      },
      averageScores: {
        overall: 4.3,
        technical: 4.7,
        communication: 3.7,
      },
      statusDistribution: [
        {
          key: InterviewStatus.SCHEDULED,
          count: 3,
        },
        {
          key: InterviewStatus.IN_PROGRESS,
          count: 0,
        },
        {
          key: InterviewStatus.COMPLETED,
          count: 4,
        },
        {
          key: InterviewStatus.CANCELLED,
          count: 1,
        },
      ],
      typeDistribution: [
        {
          key: InterviewType.TECHNICAL,
          count: 5,
        },
        {
          key: InterviewType.CODING,
          count: 3,
        },
        {
          key: InterviewType.SYSTEM_DESIGN,
          count: 0,
        },
        {
          key: InterviewType.BEHAVIORAL,
          count: 0,
        },
        {
          key: InterviewType.OTHER,
          count: 0,
        },
      ],
      recommendationDistribution: [
        {
          key: Recommendation.STRONG_HIRE,
          count: 2,
        },
        {
          key: Recommendation.HIRE,
          count: 0,
        },
        {
          key: Recommendation.CONTINUE_PRACTICE,
          count: 1,
        },
        {
          key: Recommendation.NO_HIRE,
          count: 0,
        },
      ],
    });

    expect(mocks.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "reports_data_loaded",
        summary: {
          totalInterviews: 10,
          completedInterviews: 4,
          submittedFeedback: 3,
          completionRate: 40,
          feedbackCoverage: 75,
        },
      }),
      "Reports data loaded.",
    );
  });

  it("handles an empty database", async () => {
    mocks.interviewCount.mockResolvedValue(0);
    mocks.feedbackCount.mockResolvedValue(0);

    mocks.feedbackAggregate.mockResolvedValue({
      _avg: {
        overallScore: null,
        technicalScore: null,
        communicationScore: null,
      },
    });

    mocks.interviewGroupBy.mockResolvedValue([]);
    mocks.feedbackGroupBy.mockResolvedValue([]);

    const result = await getReportsData();

    expect(result.summary).toEqual({
      totalInterviews: 0,
      completedInterviews: 0,
      submittedFeedback: 0,
      completionRate: 0,
      feedbackCoverage: 0,
    });

    expect(result.averageScores).toEqual({
      overall: null,
      technical: null,
      communication: null,
    });

    expect(
      result.statusDistribution.every(
        (item) => item.count === 0,
      ),
    ).toBe(true);

    expect(
      result.typeDistribution.every(
        (item) => item.count === 0,
      ),
    ).toBe(true);

    expect(
      result.recommendationDistribution.every(
        (item) => item.count === 0,
      ),
    ).toBe(true);
  });

  it("logs failures and throws a safe error", async () => {
    const databaseError = new Error(
      "Database unavailable",
    );

    mocks.interviewCount.mockRejectedValue(databaseError);

    await expect(getReportsData()).rejects.toThrow(
      "Unable to load reports data.",
    );

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "reports_data_failed",
        err: databaseError,
      },
      "Unable to load reports data.",
    );
  });
});