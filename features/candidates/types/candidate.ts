import type {
  SeniorityLevel,
} from "@/generated/prisma/enums";

export type CandidateListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentRole: string | null;
  targetRole: string;
  seniority: SeniorityLevel;
  yearsExperience: number | null;
  createdAt: Date;
  interviewCount: number;
};

export type CandidateListData = {
  candidates: CandidateListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};