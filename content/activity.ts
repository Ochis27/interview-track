import { AuditLevel } from "@/generated/prisma/enums";

import { pageContent } from "@/content/pages";

export const auditLevelLabels = {
  [AuditLevel.INFO]: "Information",
  [AuditLevel.WARNING]: "Warning",
  [AuditLevel.ERROR]: "Error",
} satisfies Record<AuditLevel, string>;

export const activityContent = {
  page: pageContent.activity,

  filters: {
    searchLabel: "Search activity logs",
    searchPlaceholder:
      "Search by message, action, entity, or user...",
    levelLabel: "Filter by level",
    allLevels: "All levels",
    clearSearch: "Clear search",
  },

  table: {
    caption: "Administrative and business activity logs",

    columns: {
      level: "Level",
      message: "Event",
      action: "Action",
      entity: "Entity",
      actor: "Actor",
      ipAddress: "IP address",
      createdAt: "Occurred at",
    },

    systemActor: "System",
    unknownValue: "Not available",

    emptyTitle: "No activity logs found",
    emptyDescription:
      "Try changing the search query or selected activity level.",
  },

  pagination: {
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    results: "results",
  },

  loading: {
    label: "Loading activity logs",
  },

  errors: {
    loadingFailed:
      "Unable to load activity logs. Please try again.",
  },
} as const;