import { z } from "zod";

const candidateListParamsSchema = z.object({
  query: z
    .string()
    .trim()
    .max(100)
    .catch(""),
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
    .enum([
      "name",
      "createdAt",
      "seniority",
    ])
    .catch("createdAt"),
  sortDirection: z
    .enum(["asc", "desc"])
    .catch("desc"),
});

export type CandidateListParams = z.infer<
  typeof candidateListParamsSchema
>;

export type CandidateSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(
  value: string | string[] | undefined,
) {
  return Array.isArray(value)
    ? value[0]
    : value;
}

export function parseCandidateListParams(
  params: CandidateSearchParams,
): CandidateListParams {
  return candidateListParamsSchema.parse({
    query: firstValue(params.query),
    page: firstValue(params.page),
    pageSize: firstValue(params.pageSize),
    sortBy: firstValue(params.sortBy),
    sortDirection: firstValue(
      params.sortDirection,
    ),
  });
}