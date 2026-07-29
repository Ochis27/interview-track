import type {
  InterviewStatus,
  InterviewType,
  Recommendation,
  SeniorityLevel,
} from "@/generated/prisma/enums";

export type InterviewFeedbackDetails = {
  id: string;
  strengths: string;
  improvementAreas: string;
  recommendation: Recommendation;
  overallScore: number;
  technicalScore: number | null;
  communicationScore: number | null;
  additionalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

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
  feedback: InterviewFeedbackDetails | null;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    targetRole: string | null;
    seniority: SeniorityLevel;
  };
};