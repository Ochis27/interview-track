import { z } from "zod";

import type {
  ActivityListParams,
  ActivitySearchParams,
} from "@/features/activity/types/activity";
import { AuditLevel } from "@/generated/prisma/enums";

function getFirstSearchValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export const activityListParamsSchema = z.object({
  query: z.preprocess(
    getFirstSearchValue,
    z.string().trim().max(120).catch(""),
  ),

  level: z.preprocess(
    getFirstSearchValue,
    z
      .enum([
        "ALL",
        AuditLevel.INFO,
        AuditLevel.WARNING,
        AuditLevel.ERROR,
      ])
      .catch("ALL"),
  ),

  page: z.preprocess(
    getFirstSearchValue,
    z.coerce.number().int().min(1).catch(1),
  ),

  pageSize: z.preprocess(
    getFirstSearchValue,
    z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .catch(10),
  ),

  sortBy: z.preprocess(
    getFirstSearchValue,
    z
      .enum(["createdAt", "level", "action"])
      .catch("createdAt"),
  ),

  sortDirection: z.preprocess(
    getFirstSearchValue,
    z.enum(["asc", "desc"]).catch("desc"),
  ),
});

export function parseActivityListParams(
  searchParams: ActivitySearchParams,
): ActivityListParams {
  return activityListParamsSchema.parse(searchParams);
}