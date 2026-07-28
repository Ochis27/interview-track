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
  form: {
  title: "Add candidate",
  description:
    "Create a candidate profile that can be used when scheduling interviews.",
  addButton: "Add candidate",
  submit: "Create candidate",
  submitting: "Creating candidate...",
  cancel: "Cancel",
  seniorityPlaceholder: "Select seniority",
  fields: {
    firstName: {
      label: "First name",
      placeholder: "Alice",
    },
    lastName: {
      label: "Last name",
      placeholder: "Johnson",
    },
    email: {
      label: "Email address",
      placeholder: "alice@example.com",
    },
    phone: {
      label: "Phone number",
      placeholder: "+40 700 000 000",
    },
    currentRole: {
      label: "Current role",
      placeholder: "Frontend Developer",
    },
    targetRole: {
      label: "Target role",
      placeholder: "Senior Engineer",
    },
    seniority: {
      label: "Seniority",
    },
    yearsExperience: {
      label: "Years of experience",
      placeholder: "5",
    },
    notes: {
      label: "Notes",
      placeholder: "Add relevant candidate information...",
    },
  },
  feedback: {
    validationError: "Please correct the highlighted fields.",
    duplicateEmail: "A candidate with this email already exists.",
    createError: "Unable to create the candidate. Please try again.",
  },
},
} as const;