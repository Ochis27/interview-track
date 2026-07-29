import "server-only";

import type { ReportsData } from "@/features/reports/types/reports";
import {
  InterviewStatus,
  InterviewType,
  Recommendation,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

const interviewStatuses = [
  InterviewStatus.SCHEDULED,
  InterviewStatus.IN_PROGRESS,
  InterviewStatus.COMPLETED,
  InterviewStatus.CANCELLED,
] as const;

const interviewTypes = [
  InterviewType.TECHNICAL,
  InterviewType.CODING,
  InterviewType.SYSTEM_DESIGN,
  InterviewType.BEHAVIORAL,
  InterviewType.OTHER,
] as const;

const recommendations = [
  Recommendation.STRONG_HIRE,
  Recommendation.HIRE,
  Recommendation.CONTINUE_PRACTICE,
  Recommendation.NO_HIRE,
] as const;

function calculatePercentage(
  value: number,
  total: number,
) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function roundAverage(value: number | null) {
  if (value === null) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

export async function getReportsData(): Promise<ReportsData> {
  const startedAt = performance.now();

  try {
    const [
      totalInterviews,
      completedInterviews,
      submittedFeedback,
      scoreAverages,
      statusGroups,
      typeGroups,
      recommendationGroups,
    ] = await Promise.all([
      prisma.interviewSession.count(),
      prisma.interviewSession.count({
        where: {
          status: InterviewStatus.COMPLETED,
        },
      }),
      prisma.feedback.count(),
      prisma.feedback.aggregate({
        _avg: {
          overallScore: true,
          technicalScore: true,
          communicationScore: true,
        },
      }),
      prisma.interviewSession.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),
      prisma.interviewSession.groupBy({
        by: ["type"],
        _count: {
          _all: true,
        },
      }),
      prisma.feedback.groupBy({
        by: ["recommendation"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const statusCounts = new Map(
      statusGroups.map((group) => [
        group.status,
        group._count._all,
      ]),
    );

    const typeCounts = new Map(
      typeGroups.map((group) => [
        group.type,
        group._count._all,
      ]),
    );

    const recommendationCounts = new Map(
      recommendationGroups.map((group) => [
        group.recommendation,
        group._count._all,
      ]),
    );

    const data: ReportsData = {
      summary: {
        totalInterviews,
        completedInterviews,
        submittedFeedback,
        completionRate: calculatePercentage(
          completedInterviews,
          totalInterviews,
        ),
        feedbackCoverage: calculatePercentage(
          submittedFeedback,
          completedInterviews,
        ),
      },
      averageScores: {
        overall: roundAverage(
          scoreAverages._avg.overallScore,
        ),
        technical: roundAverage(
          scoreAverages._avg.technicalScore,
        ),
        communication: roundAverage(
          scoreAverages._avg.communicationScore,
        ),
      },
      statusDistribution: interviewStatuses.map(
        (status) => ({
          key: status,
          count: statusCounts.get(status) ?? 0,
        }),
      ),
      typeDistribution: interviewTypes.map((type) => ({
        key: type,
        count: typeCounts.get(type) ?? 0,
      })),
      recommendationDistribution: recommendations.map(
        (recommendation) => ({
          key: recommendation,
          count:
            recommendationCounts.get(recommendation) ?? 0,
        }),
      ),
    };

    logger.debug(
      {
        action: "reports_data_loaded",
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        summary: data.summary,
      },
      "Reports data loaded.",
    );

    return data;
  } catch (error) {
    logger.error(
      {
        action: "reports_data_failed",
        err: error,
      },
      "Unable to load reports data.",
    );

    throw new Error("Unable to load reports data.");
  }
}