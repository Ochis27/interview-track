import type {
  ApplicationPage,
  PageContent,
} from "@/types/page-content";

export const pageContent = {
  dashboard: {
    title: "Dashboard",
    description:
      "Monitor candidates, upcoming sessions, and interview outcomes.",
  },
  candidates: {
    title: "Candidates",
    description:
      "Create and manage candidate profiles and interview history.",
  },
  interviews: {
    title: "Interviews",
    description:
      "Schedule technical interviews and track their progress.",
  },
  reports: {
    title: "Reports",
    description:
      "Review interview trends, outcomes, and candidate performance.",
  },
  activity: {
    title: "Activity Logs",
    description:
      "Review important administrative and business events.",
  },
} satisfies Record<ApplicationPage, PageContent>;