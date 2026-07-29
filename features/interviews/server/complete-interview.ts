"use server";

import { revalidatePath } from "next/cache";

import { interviewsContent } from "@/content/interviews";
import {
  InterviewStatus,
} from "@/generated/prisma/enums";
import {
  auditActions,
  auditEntityTypes,
} from "@/lib/audit/audit-events";
import { recordAuditEvent } from "@/lib/audit/record-audit-event";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export type CompleteInterviewResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function completeInterview(
  interviewId: string,
): Promise<CompleteInterviewResult> {
  const startedAt = performance.now();
  const errors = interviewsContent.details.errors;

  try {
    const interview =
      await prisma.interviewSession.findUnique({
        where: {
          id: interviewId,
        },
        select: {
          id: true,
          status: true,
        },
      });

    if (!interview) {
      logger.warn(
        {
          action: "interview_completion_missing",
          interviewId,
        },
        "Unable to complete missing interview.",
      );

      return {
        success: false,
        message: errors.notFound,
      };
    }

    if (
      interview.status ===
      InterviewStatus.COMPLETED
    ) {
      logger.info(
        {
          action: "interview_already_completed",
          interviewId,
        },
        "Interview was already completed.",
      );

      return {
        success: true,
      };
    }

    if (
      interview.status ===
      InterviewStatus.CANCELLED
    ) {
      logger.warn(
        {
          action:
            "interview_completion_rejected",
          interviewId,
          status: interview.status,
        },
        "Cancelled interview cannot be completed.",
      );

      return {
        success: false,
        message: errors.cannotComplete,
      };
    }

    await prisma.interviewSession.update({
      where: {
        id: interviewId,
      },
      data: {
        completedAt: new Date(),
        status: InterviewStatus.COMPLETED,
      },
    });

    await recordAuditEvent({
      action: auditActions.interviewCompleted,
      entityType: auditEntityTypes.interview,
      entityId: interviewId,
      message: "Interview session completed.",
      metadata: {
        status: InterviewStatus.COMPLETED,
      },
    });

    logger.info(
      {
        action: "interview_completed",
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        interviewId,
      },
      "Interview completed.",
    );

    revalidatePath("/");
    revalidatePath("/interviews");
    revalidatePath(`/interviews/${interviewId}`);

    return {
      success: true,
    };
  } catch (error) {
    logger.error(
      {
        action: "interview_completion_failed",
        err: error,
        interviewId,
      },
      "Unable to complete interview.",
    );

    return {
      success: false,
      message: errors.completionFailed,
    };
  }
}