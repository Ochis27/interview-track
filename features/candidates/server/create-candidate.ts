"use server";

import { revalidatePath } from "next/cache";

import { candidatesContent } from "@/content/candidates";
import {
  candidateFormSchema,
  type CandidateFormInput,
} from "@/features/candidates/schemas/candidate-form";
import {
  auditActions,
  auditEntityTypes,
} from "@/lib/audit/audit-events";
import { recordAuditEvent } from "@/lib/audit/record-audit-event";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export type CandidateFieldErrors = Partial<
  Record<keyof CandidateFormInput, string[]>
>;

export type CreateCandidateResult =
  | {
      success: true;
      candidateId: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: CandidateFieldErrors;
    };

function isUniqueConstraintError(
  error: unknown,
): boolean {
  if (!(error instanceof Object)) {
    return false;
  }

  return "code" in error && error.code === "P2002";
}

export async function createCandidate(
  input: unknown,
): Promise<CreateCandidateResult> {
  const validation =
    candidateFormSchema.safeParse(input);

  if (!validation.success) {
    logger.warn(
      {
        action:
          "candidate_create_validation_failed",
        fields: Object.keys(
          validation.error.flatten().fieldErrors,
        ),
      },
      "Candidate creation validation failed.",
    );

    return {
      success: false,
      message:
        candidatesContent.form.feedback
          .validationError,
      fieldErrors:
        validation.error.flatten().fieldErrors,
    };
  }

  const startedAt = Date.now();
  const values = validation.data;

  try {
    const candidate = await prisma.candidate.create({
      data: values,
      select: {
        id: true,
      },
    });

    await recordAuditEvent({
      action: auditActions.candidateCreated,
      entityType: auditEntityTypes.candidate,
      entityId: candidate.id,
      message: "Candidate profile created.",
      metadata: {
        email: values.email,
        seniority: values.seniority,
        targetRole: values.targetRole,
      },
    });

    revalidatePath("/candidates");

    logger.info(
      {
        action: "candidate_created",
        candidateId: candidate.id,
        durationMs: Date.now() - startedAt,
      },
      "Candidate created successfully.",
    );

    return {
      success: true,
      candidateId: candidate.id,
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      logger.warn(
        {
          action:
            "candidate_create_duplicate_email",
        },
        "Candidate creation rejected because the email already exists.",
      );

      return {
        success: false,
        message:
          candidatesContent.form.feedback
            .duplicateEmail,
        fieldErrors: {
          email: [
            candidatesContent.form.feedback
              .duplicateEmail,
          ],
        },
      };
    }

    logger.error(
      {
        action: "candidate_create_failed",
        durationMs: Date.now() - startedAt,
        err: error,
      },
      "Candidate creation failed.",
    );

    return {
      success: false,
      message:
        candidatesContent.form.feedback.createError,
    };
  }
}