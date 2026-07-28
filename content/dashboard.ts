import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck2,
  CalendarDays,
  MessageSquareCheck,
  UsersRound,
} from "lucide-react";

import type {
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";
import type {
  DashboardSummary,
} from "@/features/dashboard/types/dashboard";

type SummaryCardDefinition = {
  key: keyof DashboardSummary;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const dashboardContent = {
  summarySectionLabel: "Interview overview",
  summaryCards: [
    {
      key: "totalCandidates",
      label: "Total candidates",
      description: "Candidate profiles currently tracked",
      icon: UsersRound,
    },
    {
      key: "totalInterviews",
      label: "Total interviews",
      description: "All interview sessions created",
      icon: CalendarDays,
    },
    {
      key: "scheduledInterviews",
      label: "Scheduled interviews",
      description: "Sessions waiting to take place",
      icon: CalendarCheck2,
    },
    {
      key: "completedFeedback",
      label: "Completed feedback",
      description: "Feedback recorded for completed sessions",
      icon: MessageSquareCheck,
    },
  ] satisfies readonly SummaryCardDefinition[],
  upcoming: {
    title: "Upcoming interviews",
    description:
      "The next scheduled interview practice sessions.",
    emptyTitle: "No upcoming interviews",
    emptyDescription:
      "Newly scheduled sessions will appear here.",
    durationSuffix: "min",
    dateFormat: "MMM d, yyyy 'at' HH:mm",
  },
  interviewTypeLabels: {
    TECHNICAL: "Technical",
    CODING: "Coding",
    SYSTEM_DESIGN: "System design",
    BEHAVIORAL: "Behavioral",
    OTHER: "Other",
  } satisfies Record<InterviewType, string>,
  seniorityLabels: {
    JUNIOR: "Junior",
    MIDDLE: "Middle",
    SENIOR: "Senior",
    LEAD: "Lead",
  } satisfies Record<SeniorityLevel, string>,
  loadingLabel: "Loading dashboard",
} as const;