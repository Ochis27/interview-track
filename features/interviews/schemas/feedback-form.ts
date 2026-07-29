import { z } from "zod";

import { interviewsContent } from "@/content/interviews";
import { Recommendation } from "@/generated/prisma/enums";

const messages =
  interviewsContent.feedbackForm.validation;

const scoreSchema = z
  .number()
  .int(messages.scoreInteger)
  .min(1, messages.scoreMinimum)
  .max(5, messages.scoreMaximum);

export const feedbackFormSchema = z.object({
  strengths: z
    .string()
    .trim()
    .min(3, messages.strengthsMinimum)
    .max(2_000, messages.strengthsMaximum),

  improvementAreas: z
    .string()
    .trim()
    .min(3, messages.improvementMinimum)
    .max(2_000, messages.improvementMaximum),

  recommendation: z.enum(Recommendation),

  overallScore: scoreSchema,

  technicalScore: scoreSchema.nullable(),

  communicationScore: scoreSchema.nullable(),

  additionalNotes: z
    .string()
    .trim()
    .max(2_000, messages.notesMaximum)
    .transform((value) => value || null),
});

export type FeedbackFormInput = z.input<
  typeof feedbackFormSchema
>;

export type FeedbackFormValues = z.output<
  typeof feedbackFormSchema
>;