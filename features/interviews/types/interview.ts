import type {
  InterviewStatus,
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";

export type InterviewListItem = {
  id: string;
  title: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: Date;
  durationMinutes: number;
  completedAt: Date | null;
  hasFeedback: boolean;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    seniority: SeniorityLevel;
  };
};

export type InterviewListData = {
  interviews: InterviewListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};