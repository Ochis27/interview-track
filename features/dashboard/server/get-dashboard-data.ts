import "server-only";

import { InterviewStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import type {
  DashboardData,
} from "@/features/dashboard/types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const startedAt = Date.now();
  const currentDate = new Date();

  try {
    const [
      totalCandidates,
      totalInterviews,
      scheduledInterviews,
      completedFeedback,
      upcomingInterviews,
    ] = await Promise.all([
      prisma.candidate.count(),

      prisma.interviewSession.count(),

      prisma.interviewSession.count({
        where: {
          status: InterviewStatus.SCHEDULED,
        },
      }),

      prisma.feedback.count({
        where: {
          interviewSession: {
            is: {
              status: InterviewStatus.COMPLETED,
            },
          },
        },
      }),

      prisma.interviewSession.findMany({
        where: {
          status: InterviewStatus.SCHEDULED,
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
      }),
    ]);

    const summary = {
      totalCandidates,
      totalInterviews,
      scheduledInterviews,
      completedFeedback,
    };

    logger.debug(
      {
        action: "dashboard_data_loaded",
        durationMs: Date.now() - startedAt,
        summary,
      },
      "Dashboard data loaded.",
    );

    return {
      summary,
      upcomingInterviews,
    };
  } catch (error) {
    logger.error(
      {
        action: "dashboard_data_load_failed",
        durationMs: Date.now() - startedAt,
        err: error,
      },
      "Failed to load dashboard data.",
    );

    throw new Error(
      "Unable to load dashboard data.",
    );
  }
}