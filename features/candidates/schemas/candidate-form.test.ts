import { describe, expect, it } from "vitest";

import { candidateFormSchema } from "@/features/candidates/schemas/candidate-form";
import { SeniorityLevel } from "@/generated/prisma/enums";

const validCandidate = {
  firstName: "Alice",
  lastName: "Johnson",
  email: "alice@example.com",
  phone: "+40 700 000 000",
  currentRole: "Frontend Developer",
  targetRole: "Senior Engineer",
  seniority: SeniorityLevel.MIDDLE,
  yearsExperience: 5,
  notes: "Strong React and TypeScript experience.",
};

describe("candidateFormSchema", () => {
  it("accepts and normalizes a valid candidate", () => {
    const result = candidateFormSchema.parse({
      ...validCandidate,
      firstName: "  Alice  ",
      email: "  alice@example.com  ",
    });

    expect(result).toEqual(validCandidate);
  });

  it("converts empty optional text fields to null", () => {
    const result = candidateFormSchema.parse({
      ...validCandidate,
      phone: "   ",
      currentRole: "",
      notes: "",
      yearsExperience: null,
    });

    expect(result.phone).toBeNull();
    expect(result.currentRole).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.yearsExperience).toBeNull();
  });

  it("rejects missing required candidate information", () => {
    const result = candidateFormSchema.safeParse({
      ...validCandidate,
      firstName: "",
      lastName: "",
      email: "invalid-email",
      targetRole: "",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected candidate validation to fail.");
    }

    const errors = result.error.flatten().fieldErrors;

    expect(errors.firstName).toContain("First name is required.");
    expect(errors.lastName).toContain("Last name is required.");
    expect(errors.email).toContain("Enter a valid email address.");
    expect(errors.targetRole).toContain("Target role is required.");
  });

  it("rejects invalid experience and seniority values", () => {
    const invalidExperience = candidateFormSchema.safeParse({
      ...validCandidate,
      yearsExperience: 61,
    });

    const invalidSeniority = candidateFormSchema.safeParse({
      ...validCandidate,
      seniority: "UNKNOWN",
    });

    expect(invalidExperience.success).toBe(false);
    expect(invalidSeniority.success).toBe(false);
  });
});