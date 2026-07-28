import "server-only";

import type {
  Prisma,
} from "@/generated/prisma/client";
import type {
  CandidateListParams,
} from "@/features/candidates/schemas/candidate-list-params";
import type {
  CandidateListData,
} from "@/features/candidates/types/candidate";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

function createSearchFilter(
  query: string,
): Prisma.CandidateWhereInput | undefined {
  if (!query) {
    return undefined;
  }

  return {
    OR: [
      {
        firstName: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        lastName: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        targetRole: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],
  };
}

function createOrderBy(
  params: CandidateListParams,
): Prisma.CandidateOrderByWithRelationInput[] {
  const { sortBy, sortDirection } = params;

  if (sortBy === "name") {
    return [
      { lastName: sortDirection },
      { firstName: sortDirection },
    ];
  }

  if (sortBy === "seniority") {
    return [
      { seniority: sortDirection },
      { lastName: "asc" },
    ];
  }

  return [
    { createdAt: sortDirection },
  ];
}

export async function getCandidates(
  params: CandidateListParams,
): Promise<CandidateListData> {
  const startedAt = Date.now();
  const where = createSearchFilter(params.query);

  try {
    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy: createOrderBy(params),
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          currentRole: true,
          targetRole: true,
          seniority: true,
          yearsExperience: true,
          createdAt: true,
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      }),

      prisma.candidate.count({
        where,
      }),
    ]);

    const result = {
      candidates: candidates.map(
        ({ _count, ...candidate }) => ({
          ...candidate,
          interviewCount:
            _count.interviews,
        }),
      ),
      total,
      page: params.page,
      pageSize: params.pageSize,
      pageCount: Math.ceil(
        total / params.pageSize,
      ),
    };

    logger.debug(
      {
        action: "candidates_list_loaded",
        durationMs: Date.now() - startedAt,
        page: params.page,
        pageSize: params.pageSize,
        resultCount: result.candidates.length,
        total,
      },
      "Candidate list loaded.",
    );

    return result;
  } catch (error) {
    logger.error(
      {
        action: "candidates_list_load_failed",
        durationMs: Date.now() - startedAt,
        err: error,
      },
      "Failed to load candidate list.",
    );

    throw new Error(
      "Unable to load candidates.",
    );
  }
}