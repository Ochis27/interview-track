import type {
  InterviewStatus,
  InterviewType,
  Recommendation,
} from "@/generated/prisma/enums";

export type ReportCount<TKey extends string> = {
  key: TKey;
  count: number;
};

export type ReportsSummary = {
  totalInterviews: number;
  completedInterviews: number;
  submittedFeedback: number;
  completionRate: number;
  feedbackCoverage: number;
};

export type ReportsAverageScores = {
  overall: number | null;
  technical: number | null;
  communication: number | null;
};

export type ReportsData = {
  summary: ReportsSummary;
  averageScores: ReportsAverageScores;
  statusDistribution: ReportCount<InterviewStatus>[];
  typeDistribution: ReportCount<InterviewType>[];
  recommendationDistribution: ReportCount<Recommendation>[];
};