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
  form: {
    title: "Schedule interview",
    description:
      "Create a new interview session for an existing candidate.",
    fields: {
      candidate: "Candidate",
      interviewTitle: "Interview title",
      type: "Interview type",
      scheduledAt: "Scheduled date and time",
      duration: "Duration in minutes",
      notes: "Notes",
    },
    placeholders: {
      candidate: "Select a candidate",
      interviewTitle: "e.g. Senior frontend interview",
      type: "Select an interview type",
      notes:
        "Add preparation notes or interview context...",
    },
    submit: "Schedule interview",
    submitting: "Scheduling...",
    cancel: "Cancel",
    validation: {
      candidateRequired: "Select a candidate.",
      titleMinimum:
        "Interview title must contain at least 3 characters.",
      titleMaximum:
        "Interview title cannot exceed 120 characters.",
      dateRequired: "Select a date and time.",
      dateInvalid: "Enter a valid date and time.",
      durationMinimum:
        "Interview duration must be at least 15 minutes.",
      durationMaximum:
        "Interview duration cannot exceed 480 minutes.",
      notesMaximum:
        "Notes cannot exceed 2,000 characters.",
    },
    errors: {
      validation:
        "Review the highlighted fields and try again.",
      candidateMissing:
        "The selected candidate no longer exists.",
      creationFailed:
        "Unable to schedule the interview. Please try again.",
    },
    noCandidates:
  "Create at least one candidate before scheduling an interview.",
  },
} as const;