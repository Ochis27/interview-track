export const candidatesContent = {
  page: {
    title: "Candidates",
    description:
      "Create and manage candidate profiles and their interview history.",
  },
  search: {
    label: "Search candidates",
    placeholder: "Search by name, email, or target role...",
    submit: "Search",
    clear: "Clear",
  },
  table: {
    caption: "Candidate profiles",
    sortByLabel: "Sort by",
    columns: {
        name: "Candidate",
        targetRole: "Target role",
        seniority: "Seniority",
        experience: "Experience",
        interviews: "Interviews",
        createdAt: "Added",
    },
    emptyTitle: "No candidates found",
    emptyDescription:
        "No candidate profiles match the current search criteria.",
    notProvided: "Not provided",
    yearsSuffix: "years",
    },
  pagination: {
    previous: "Previous",
    next: "Next",
    pageLabel: "Page",
    ofLabel: "of",
    resultsLabel: "candidates",
  },
  sortByLabel: "Sort by",
  seniority: {
    JUNIOR: "Junior",
    MIDDLE: "Middle",
    SENIOR: "Senior",
    LEAD: "Lead",
  },
} as const;