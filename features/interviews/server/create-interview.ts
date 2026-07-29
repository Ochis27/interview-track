"use server";

import { interviewsContent } from "@/content/interviews";
import {
  interviewFormSchema,
  type InterviewFormInput,
} from "@/features/interviews/schemas/interview-form";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

type InterviewFieldErrors = Partial<
  Record<keyof InterviewFormInput, string[]>
>;

export type CreateInterviewResult =
  | {
      success: true;
      interviewId: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: InterviewFieldErrors;
    };

export async function createInterview(
  input: unknown,
): Promise<CreateInterviewResult> {
  const parsed = interviewFormSchema.safeParse(input);
  const errors = interviewsContent.form.errors;

  if (!parsed.success) {
    return {
      success: false,
      message: errors.validation,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const startedAt = performance.now();
  const values = parsed.data;

  try {
    const candidate = await prisma.candidate.findUnique({
      where: {
        id: values.candidateId,
      },
      select: {
        id: true,
      },
    });

    if (!candidate) {
      logger.warn(
        {
          action: "interview_candidate_missing",
          candidateId: values.candidateId,
        },
        "Unable to schedule interview for missing candidate.",
      );

      return {
        success: false,
        message: errors.candidateMissing,
        fieldErrors: {
          candidateId: [errors.candidateMissing],
        },
      };
    }

    const interview = await prisma.interviewSession.create({
      data: {
        candidateId: values.candidateId,
        durationMinutes: values.durationMinutes,
        notes: values.notes,
        scheduledAt: values.scheduledAt,
        title: values.title,
        type: values.type,
      },
      select: {
        id: true,
      },
    });

    logger.info(
      {
        action: "interview_created",
        candidateId: values.candidateId,
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        interviewId: interview.id,
      },
      "Interview scheduled.",
    );

    return {
      success: true,
      interviewId: interview.id,
    };
  } catch (error) {
    logger.error(
      {
        action: "interview_creation_failed",
        candidateId: values.candidateId,
        err: error,
      },
      "Unable to schedule interview.",
    );

    return {
      success: false,
      message: errors.creationFailed,
    };
  }
}