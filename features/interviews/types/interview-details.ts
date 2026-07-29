import type {
  InterviewStatus,
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";

export type InterviewDetails = {
  id: string;
  title: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: Date;
  durationMinutes: number;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  hasFeedback: boolean;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    targetRole: string | null;
    seniority: SeniorityLevel;
  };
};