import { z } from "zod";

import { InterviewStatus } from "@/generated/prisma/enums";

export type InterviewSearchParams = Record<
  string,
  string | string[] | undefined
>;

const interviewStatusFilterSchema = z.union([
  z.literal("ALL"),
  z.enum(InterviewStatus),
]);

export const interviewListParamsSchema = z.object({
  query: z.string().trim().max(100).catch(""),

  status: interviewStatusFilterSchema.catch("ALL"),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(10_000)
    .catch(1),

  pageSize: z.coerce
    .number()
    .int()
    .min(5)
    .max(50)
    .catch(10),

  sortBy: z
    .enum(["scheduledAt", "createdAt", "title", "status"])
    .catch("scheduledAt"),

  sortDirection: z.enum(["asc", "desc"]).catch("desc"),
});

export type InterviewListParams = z.infer<
  typeof interviewListParamsSchema
>;

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseInterviewListParams(
  searchParams: InterviewSearchParams,
): InterviewListParams {
  return interviewListParamsSchema.parse({
    query: firstValue(searchParams.query),
    status: firstValue(searchParams.status),
    page: firstValue(searchParams.page),
    pageSize: firstValue(searchParams.pageSize),
    sortBy: firstValue(searchParams.sortBy),
    sortDirection: firstValue(searchParams.sortDirection),
  });
}