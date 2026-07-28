import {
  InterviewStatus,
  InterviewType,
} from "@/generated/prisma/enums";

export const interviewStatusLabels = {
  [InterviewStatus.SCHEDULED]: "Scheduled",
  [InterviewStatus.IN_PROGRESS]: "In progress",
  [InterviewStatus.COMPLETED]: "Completed",
  [InterviewStatus.CANCELLED]: "Cancelled",
} satisfies Record<InterviewStatus, string>;

export const interviewTypeLabels = {
  [InterviewType.TECHNICAL]: "Technical",
  [InterviewType.CODING]: "Coding",
  [InterviewType.SYSTEM_DESIGN]: "System design",
  [InterviewType.BEHAVIORAL]: "Behavioral",
  [InterviewType.OTHER]: "Other",
} satisfies Record<InterviewType, string>;

export const interviewsContent = {
  page: {
    title: "Interviews",
    description:
      "Schedule interviews, follow their progress, and review completed sessions.",
  },
  actions: {
    create: "Schedule interview",
  },
  filters: {
    searchLabel: "Search interviews",
    searchPlaceholder:
      "Search by interview title, candidate name, or email...",
    statusLabel: "Filter by status",
    allStatuses: "All statuses",
    clearSearch: "Clear search",
  },
  table: {
    caption: "Interview sessions",
    columns: {
      title: "Interview",
      candidate: "Candidate",
      status: "Status",
      scheduledAt: "Scheduled for",
      duration: "Duration",
      feedback: "Feedback",
    },
    feedbackAvailable: "Submitted",
    feedbackMissing: "Not submitted",
    minutes: "min",
    emptyTitle: "No interviews found",
    emptyDescription:
      "Try changing the search or status filter, or schedule a new interview.",
  },
  pagination: {
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    results: "results",
  },
  loading: {
    label: "Loading interviews",
  },
} as const;