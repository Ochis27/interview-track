import {
  InterviewStatus,
  InterviewType,
  Recommendation,
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

export const recommendationLabels = {
  [Recommendation.STRONG_HIRE]: "Strong hire",
  [Recommendation.HIRE]: "Hire",
  [Recommendation.CONTINUE_PRACTICE]:
    "Continue practice",
  [Recommendation.NO_HIRE]: "No hire",
} satisfies Record<Recommendation, string>;

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
    noCandidates:
      "Create at least one candidate before scheduling an interview.",

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
  },

  details: {
    back: "Back to interviews",
    overviewTitle: "Interview overview",
    candidateTitle: "Candidate",
    notesTitle: "Preparation notes",
    feedbackTitle: "Feedback",
    description:
      "Review the candidate, schedule, preparation notes, and feedback status.",
    loadingLabel: "Loading interview details",

    labels: {
      status: "Status",
      type: "Interview type",
      scheduledAt: "Scheduled for",
      duration: "Duration",
      completedAt: "Completed at",
      createdAt: "Created at",
      email: "Email",
      targetRole: "Target role",
      seniority: "Seniority",
    },

    minutes: "minutes",
    noNotes: "No preparation notes were added.",
    notSpecified: "Not specified",

    feedbackAvailable:
      "Structured feedback has been submitted for this interview.",
    feedbackPending:
      "Feedback has not been submitted for this interview.",

    actions: {
      complete: "Complete interview",
      completing: "Completing...",
    },

    errors: {
      notFound: "The interview no longer exists.",
      cannotComplete:
        "A cancelled interview cannot be completed.",
      completionFailed:
        "Unable to complete the interview. Please try again.",
    },

    completeDialog: {
      title: "Complete interview?",
      description:
        "This will mark the interview as completed and record the current completion time.",
      cancel: "Keep interview open",
      confirm: "Complete interview",
    },
  },

  feedbackForm: {
    title: "Interview feedback",
    description:
      "Capture structured observations and a final recommendation.",

    fields: {
      strengths: "Strengths",
      improvementAreas: "Improvement areas",
      recommendation: "Recommendation",
      overallScore: "Overall score",
      technicalScore: "Technical score",
      communicationScore: "Communication score",
      additionalNotes: "Additional notes",
    },

    placeholders: {
      strengths:
        "Describe the candidate's strongest areas...",
      improvementAreas:
        "Describe areas that need improvement...",
      recommendation: "Select a recommendation",
      additionalNotes:
        "Add any additional interview observations...",
    },

    scoreHint: "Score from 1 to 5",
    submit: "Submit feedback",
    submitting: "Submitting...",

    validation: {
      strengthsMinimum:
        "Strengths must contain at least 3 characters.",
      strengthsMaximum:
        "Strengths cannot exceed 2,000 characters.",
      improvementMinimum:
        "Improvement areas must contain at least 3 characters.",
      improvementMaximum:
        "Improvement areas cannot exceed 2,000 characters.",
      scoreInteger: "Scores must be whole numbers.",
      scoreMinimum: "Scores must be at least 1.",
      scoreMaximum: "Scores cannot exceed 5.",
      notesMaximum:
        "Additional notes cannot exceed 2,000 characters.",
    },

    errors: {
      validation:
        "Review the highlighted feedback fields.",
      interviewMissing:
        "The interview no longer exists.",
      interviewIncomplete:
        "Feedback can only be submitted for a completed interview.",
      feedbackExists:
        "Feedback has already been submitted for this interview.",
      creationFailed:
        "Unable to submit feedback. Please try again.",
    },

    display: {
      submittedTitle: "Submitted feedback",
      submittedDescription:
        "Review the structured feedback recorded for this interview.",
      submittedAt: "Submitted",
      recommendation: "Recommendation",
      scoreSummary: "Score summary",
      notScored: "Not scored",
      scoreSuffix: "out of 5",
    },
  },
} as const;