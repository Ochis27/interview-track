import { describe, expect, it } from "vitest";

import { interviewsContent } from "@/content/interviews";
import {
  interviewFormSchema,
  type InterviewFormInput,
} from "@/features/interviews/schemas/interview-form";
import { InterviewType } from "@/generated/prisma/enums";

const validInput: InterviewFormInput = {
  candidateId: "candidate-1",
  title: "Senior frontend interview",
  type: InterviewType.TECHNICAL,
  scheduledAt: "2026-07-30T14:30",
  durationMinutes: 60,
  notes: "Focus on React architecture.",
};

describe("interviewFormSchema", () => {
  it("parses and normalizes valid interview data", () => {
    const result = interviewFormSchema.parse(validInput);

    expect(result).toEqual({
      candidateId: "candidate-1",
      title: "Senior frontend interview",
      type: InterviewType.TECHNICAL,
      scheduledAt: new Date("2026-07-30T14:30"),
      durationMinutes: 60,
      notes: "Focus on React architecture.",
    });
  });

  it("converts empty notes to null", () => {
    const result = interviewFormSchema.parse({
      ...validInput,
      title: "  Coding interview  ",
      notes: "   ",
    });

    expect(result.title).toBe("Coding interview");
    expect(result.notes).toBeNull();
  });

  it("validates required and minimum values", () => {
    const result = interviewFormSchema.safeParse({
      ...validInput,
      candidateId: "",
      title: "ab",
      scheduledAt: "",
      durationMinutes: 14,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    const errors = result.error.flatten().fieldErrors;
    const messages = interviewsContent.form.validation;

    expect(errors.candidateId).toContain(
      messages.candidateRequired,
    );
    expect(errors.title).toContain(
      messages.titleMinimum,
    );
    expect(errors.scheduledAt).toContain(
      messages.dateRequired,
    );
    expect(errors.durationMinutes).toContain(
      messages.durationMinimum,
    );
  });

  it("validates invalid dates and maximum values", () => {
    const result = interviewFormSchema.safeParse({
      ...validInput,
      title: "a".repeat(121),
      scheduledAt: "not-a-date",
      durationMinutes: 481,
      notes: "a".repeat(2_001),
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    const errors = result.error.flatten().fieldErrors;
    const messages = interviewsContent.form.validation;

    expect(errors.title).toContain(
      messages.titleMaximum,
    );
    expect(errors.scheduledAt).toContain(
      messages.dateInvalid,
    );
    expect(errors.durationMinutes).toContain(
      messages.durationMaximum,
    );
    expect(errors.notes).toContain(
      messages.notesMaximum,
    );
  });

  it("rejects unsupported interview types", () => {
    const result = interviewFormSchema.safeParse({
      ...validInput,
      type: "UNSUPPORTED",
    });

    expect(result.success).toBe(false);
  });
});