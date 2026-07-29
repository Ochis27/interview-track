export const reportsContent = {
  page: {
    title: "Reports",
    description:
      "Review interview outcomes, completion rates, feedback coverage, and candidate evaluation trends.",
  },

  summary: {
    totalInterviews: {
      label: "Total interviews",
      description: "All interview sessions created",
    },
    completedInterviews: {
      label: "Completed interviews",
      description: "Sessions marked as completed",
    },
    completionRate: {
      label: "Completion rate",
      description: "Completed sessions out of all interviews",
    },
    feedbackCoverage: {
      label: "Feedback coverage",
      description:
        "Completed interviews with submitted feedback",
    },
  },

  charts: {
    status: {
      title: "Interviews by status",
      description:
        "Distribution of interview sessions across workflow states.",
      empty: "No interview data is available yet.",
    },
    type: {
      title: "Interviews by type",
      description:
        "Distribution of interview sessions by interview format.",
      empty: "No interview type data is available yet.",
    },
    recommendation: {
      title: "Recommendations",
      description:
        "Distribution of recommendations from submitted feedback.",
      empty: "No recommendations have been submitted yet.",
    },
  },

  scores: {
    title: "Average feedback scores",
    description:
      "Average scores calculated from submitted interview feedback.",
    overall: "Overall score",
    technical: "Technical score",
    communication: "Communication score",
    unavailable: "Not available",
    suffix: "out of 5",
  },

  units: {
    percent: "%",
    interviews: "interviews",
    feedback: "feedback entries",
  },

  loading: {
    label: "Loading reports",
  },
} as const;