import { z } from "zod";

import { SeniorityLevel } from "@/generated/prisma/enums";

function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length > 0 ? value : null));
}

export const candidateFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(80, "First name must contain at most 80 characters."),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(80, "Last name must contain at most 80 characters."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255, "Email must contain at most 255 characters."),

  phone: optionalText(30),

  currentRole: optionalText(100),

  targetRole: z
    .string()
    .trim()
    .min(1, "Target role is required.")
    .max(100, "Target role must contain at most 100 characters."),

  seniority: z.enum(SeniorityLevel),

  yearsExperience: z
    .number()
    .int("Years of experience must be a whole number.")
    .min(0, "Years of experience cannot be negative.")
    .max(60, "Years of experience cannot exceed 60.")
    .nullable(),

  notes: optionalText(2_000),
});

export type CandidateFormInput = z.input<
  typeof candidateFormSchema
>;

export type CandidateFormValues = z.output<
  typeof candidateFormSchema
>;