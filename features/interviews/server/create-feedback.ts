"use server";

import { revalidatePath } from "next/cache";

import { interviewsContent } from "@/content/interviews";
import { feedbackFormSchema } from "@/features/interviews/schemas/feedback-form";
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

type FeedbackFieldErrors = Partial<
  Record<
    keyof typeof feedbackFormSchema.shape,
    string[]
  >
>;

export type CreateFeedbackResult =
  | {
      success: true;
      feedbackId: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: FeedbackFieldErrors;
    };

export async function createFeedback(
  interviewId: string,
  input: unknown,
): Promise<CreateFeedbackResult> {
  const parsed = feedbackFormSchema.safeParse(input);
  const errors =
    interviewsContent.feedbackForm.errors;

  if (!parsed.success) {
    return {
      success: false,
      message: errors.validation,
      fieldErrors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const startedAt = performance.now();

  try {
    const interview =
      await prisma.interviewSession.findUnique({
        where: {
          id: interviewId,
        },
        select: {
          id: true,
          status: true,
          feedback: {
            select: {
              id: true,
            },
          },
        },
      });

    if (!interview) {
      logger.warn(
        {
          action: "feedback_interview_missing",
          interviewId,
        },
        "Unable to create feedback for missing interview.",
      );

      return {
        success: false,
        message: errors.interviewMissing,
      };
    }

    if (
      interview.status !==
      InterviewStatus.COMPLETED
    ) {
      logger.warn(
        {
          action:
            "feedback_interview_incomplete",
          interviewId,
          status: interview.status,
        },
        "Unable to create feedback for incomplete interview.",
      );

      return {
        success: false,
        message: errors.interviewIncomplete,
      };
    }

    if (interview.feedback) {
      logger.warn(
        {
          action: "feedback_already_exists",
          feedbackId: interview.feedback.id,
          interviewId,
        },
        "Feedback already exists for interview.",
      );

      return {
        success: false,
        message: errors.feedbackExists,
      };
    }

    const values = parsed.data;

    const feedback = await prisma.feedback.create({
      data: {
        additionalNotes: values.additionalNotes,
        communicationScore:
          values.communicationScore,
        improvementAreas:
          values.improvementAreas,
        interviewSessionId: interviewId,
        overallScore: values.overallScore,
        recommendation: values.recommendation,
        strengths: values.strengths,
        technicalScore: values.technicalScore,
      },
      select: {
        id: true,
      },
    });

    await recordAuditEvent({
      action: auditActions.feedbackSubmitted,
      entityType: auditEntityTypes.feedback,
      entityId: feedback.id,
      message: "Interview feedback submitted.",
      metadata: {
        interviewId,
        overallScore: values.overallScore,
        recommendation: values.recommendation,
      },
    });

    logger.info(
      {
        action: "feedback_created",
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        feedbackId: feedback.id,
        interviewId,
      },
      "Interview feedback created.",
    );

    revalidatePath("/");
    revalidatePath("/interviews");
    revalidatePath(`/interviews/${interviewId}`);
    revalidatePath("/reports");

    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (error) {
    logger.error(
      {
        action: "feedback_creation_failed",
        err: error,
        interviewId,
      },
      "Unable to create interview feedback.",
    );

    return {
      success: false,
      message: errors.creationFailed,
    };
  }
}