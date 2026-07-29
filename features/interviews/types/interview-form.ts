import type { SeniorityLevel } from "@/generated/prisma/enums";

export type InterviewCandidateOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  seniority: SeniorityLevel;
};