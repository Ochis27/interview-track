import { describe, expect, it } from "vitest";

import { interviewsContent } from "@/content/interviews";
import {
  feedbackFormSchema,
  type FeedbackFormInput,
} from "@/features/interviews/schemas/feedback-form";
import { Recommendation } from "@/generated/prisma/enums";

const validInput: FeedbackFormInput = {
  strengths:
    "Strong TypeScript and system design knowledge.",
  improvementAreas:
    "Could explain database trade-offs more clearly.",
  recommendation: Recommendation.HIRE,
  overallScore: 4,
  technicalScore: 4,
  communicationScore: 3,
  additionalNotes: "Good overall interview.",
};

describe("feedbackFormSchema", () => {
  it("parses and normalizes valid feedback", () => {
    const result = feedbackFormSchema.parse(validInput);

    expect(result).toEqual(validInput);
  });

  it("converts empty optional values", () => {
    const result = feedbackFormSchema.parse({
      ...validInput,
      technicalScore: null,
      communicationScore: null,
      additionalNotes: "   ",
    });

    expect(result.technicalScore).toBeNull();
    expect(result.communicationScore).toBeNull();
    expect(result.additionalNotes).toBeNull();
  });

  it("validates required text and minimum scores", () => {
    const result = feedbackFormSchema.safeParse({
      ...validInput,
      strengths: "a",
      improvementAreas: "b",
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    const errors = result.error.flatten().fieldErrors;
    const messages =
      interviewsContent.feedbackForm.validation;

    expect(errors.strengths).toContain(
      messages.strengthsMinimum,
    );
    expect(errors.improvementAreas).toContain(
      messages.improvementMinimum,
    );
    expect(errors.overallScore).toContain(
      messages.scoreMinimum,
    );
    expect(errors.technicalScore).toContain(
      messages.scoreMinimum,
    );
    expect(errors.communicationScore).toContain(
      messages.scoreMinimum,
    );
  });

  it("validates maximum lengths and scores", () => {
    const result = feedbackFormSchema.safeParse({
      ...validInput,
      strengths: "a".repeat(2_001),
      improvementAreas: "a".repeat(2_001),
      overallScore: 6,
      technicalScore: 6,
      communicationScore: 6,
      additionalNotes: "a".repeat(2_001),
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    const errors = result.error.flatten().fieldErrors;
    const messages =
      interviewsContent.feedbackForm.validation;

    expect(errors.strengths).toContain(
      messages.strengthsMaximum,
    );
    expect(errors.improvementAreas).toContain(
      messages.improvementMaximum,
    );
    expect(errors.overallScore).toContain(
      messages.scoreMaximum,
    );
    expect(errors.technicalScore).toContain(
      messages.scoreMaximum,
    );
    expect(errors.communicationScore).toContain(
      messages.scoreMaximum,
    );
    expect(errors.additionalNotes).toContain(
      messages.notesMaximum,
    );
  });

  it("rejects decimal scores and recommendations", () => {
    const result = feedbackFormSchema.safeParse({
      ...validInput,
      recommendation: "UNSUPPORTED",
      overallScore: 3.5,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(
      result.error.flatten().fieldErrors.overallScore,
    ).toContain(
      interviewsContent.feedbackForm.validation
        .scoreInteger,
    );
  });
});