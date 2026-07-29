import "server-only";

import type { InterviewDetails } from "@/features/interviews/types/interview-details";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

const interviewDetailsSelection = {
  id: true,
  title: true,
  type: true,
  status: true,
  scheduledAt: true,
  durationMinutes: true,
  notes: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  candidate: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      targetRole: true,
      seniority: true,
    },
  },
  feedback: {
    select: {
      id: true,
    },
  },
} as const;

export async function getInterviewDetails(
  interviewId: string,
): Promise<InterviewDetails | null> {
  const startedAt = performance.now();

  try {
    const interview =
      await prisma.interviewSession.findUnique({
        where: {
          id: interviewId,
        },
        select: interviewDetailsSelection,
      });

    logger.debug(
      {
        action: "interview_details_loaded",
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        found: Boolean(interview),
        interviewId,
      },
      "Interview details loaded.",
    );

    if (!interview) {
      return null;
    }

    const { feedback, ...details } = interview;

    return {
      ...details,
      hasFeedback: feedback !== null,
    };
  } catch (error) {
    logger.error(
      {
        action: "interview_details_failed",
        err: error,
        interviewId,
      },
      "Unable to load interview details.",
    );

    throw new Error("Unable to load interview details.");
  }
}