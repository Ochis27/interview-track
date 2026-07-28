import type {
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";

export type DashboardSummary = {
  totalCandidates: number;
  totalInterviews: number;
  scheduledInterviews: number;
  completedFeedback: number;
};

export type UpcomingInterview = {
  id: string;
  title: string;
  type: InterviewType;
  scheduledAt: Date;
  durationMinutes: number;
  candidate: {
    firstName: string;
    lastName: string;
    seniority: SeniorityLevel;
  };
};

export type DashboardData = {
  summary: DashboardSummary;
  upcomingInterviews: UpcomingInterview[];
};