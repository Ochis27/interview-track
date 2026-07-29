import { z } from "zod";

import { interviewsContent } from "@/content/interviews";
import { InterviewType } from "@/generated/prisma/enums";

const messages = interviewsContent.form.validation;

export const interviewFormSchema = z.object({
  candidateId: z
    .string()
    .trim()
    .min(1, messages.candidateRequired),

  title: z
    .string()
    .trim()
    .min(3, messages.titleMinimum)
    .max(120, messages.titleMaximum),

  type: z.enum(InterviewType),

  scheduledAt: z
    .string()
    .trim()
    .min(1, messages.dateRequired)
    .refine(
      (value) =>
        value.length === 0 ||
        !Number.isNaN(new Date(value).getTime()),
      messages.dateInvalid,
    )
    .transform((value) => new Date(value)),

  durationMinutes: z
    .number()
    .int()
    .min(15, messages.durationMinimum)
    .max(480, messages.durationMaximum),

  notes: z
    .string()
    .trim()
    .max(2_000, messages.notesMaximum)
    .transform((value) => value || null),
});

export type InterviewFormInput = z.input<
  typeof interviewFormSchema
>;

export type InterviewFormValues = z.output<
  typeof interviewFormSchema
>;