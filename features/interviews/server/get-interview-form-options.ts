import "server-only";

import type { InterviewCandidateOption } from "@/features/interviews/types/interview-form";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

const candidateSelection = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  seniority: true,
} as const;

export async function getInterviewFormOptions(): Promise<
  InterviewCandidateOption[]
> {
  const startedAt = performance.now();

  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
      ],
      select: candidateSelection,
    });

    logger.debug(
      {
        action: "interview_form_options_loaded",
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        totalCandidates: candidates.length,
      },
      "Interview form options loaded.",
    );

    return candidates;
  } catch (error) {
    logger.error(
      {
        action: "interview_form_options_failed",
        err: error,
      },
      "Unable to load interview form options.",
    );

    throw new Error(
      "Unable to load interview form options.",
    );
  }
}