import type { AuditLevel } from "@/generated/prisma/enums";

export type ActivitySortField =
  | "createdAt"
  | "level"
  | "action";

export type ActivitySortDirection = "asc" | "desc";

export type ActivityLevelFilter = AuditLevel | "ALL";

export type ActivitySearchParams = {
  query?: string | string[];
  level?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
  sortBy?: string | string[];
  sortDirection?: string | string[];
};

export type ActivityListParams = {
  query: string;
  level: ActivityLevelFilter;
  page: number;
  pageSize: number;
  sortBy: ActivitySortField;
  sortDirection: ActivitySortDirection;
};

export type ActivityLogActor = {
  id: string;
  name: string;
  email: string;
};

export type ActivityLogItem = {
  id: string;
  level: AuditLevel;
  action: string;
  entityType: string;
  entityId: string | null;
  message: string;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: Date;
  user: ActivityLogActor | null;
};

export type ActivityListData = {
  activities: ActivityLogItem[];
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
};