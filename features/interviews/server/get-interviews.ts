import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { InterviewListParams } from "@/features/interviews/schemas/interview-list-params";
import type { InterviewListData } from "@/features/interviews/types/interview";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

function createSearchFilter(
  query: string,
): Prisma.InterviewSessionWhereInput | undefined {
  if (!query) {
    return undefined;
  }

  return {
    OR: [
      {
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        candidate: {
          is: {
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
            ],
          },
        },
      },
    ],
  };
}

function createWhere(
  params: InterviewListParams,
): Prisma.InterviewSessionWhereInput | undefined {
  const searchFilter = createSearchFilter(params.query);

  if (params.status === "ALL") {
    return searchFilter;
  }

  return {
    ...(searchFilter ?? {}),
    status: params.status,
  };
}

function createOrderBy(
  params: InterviewListParams,
): Prisma.InterviewSessionOrderByWithRelationInput[] {
  const { sortBy, sortDirection } = params;

  if (sortBy === "title") {
    return [
      { title: sortDirection },
      { scheduledAt: "desc" },
    ];
  }

  if (sortBy === "status") {
    return [
      { status: sortDirection },
      { scheduledAt: "desc" },
    ];
  }

  if (sortBy === "createdAt") {
    return [{ createdAt: sortDirection }];
  }

  return [{ scheduledAt: sortDirection }];
}

export async function getInterviews(
  params: InterviewListParams,
): Promise<InterviewListData> {
  const startedAt = Date.now();
  const where = createWhere(params);

  try {
    const [interviews, total] = await Promise.all([
      prisma.interviewSession.findMany({
        where,
        orderBy: createOrderBy(params),
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          scheduledAt: true,
          durationMinutes: true,
          completedAt: true,
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              seniority: true,
            },
          },
          feedback: {
            select: {
              id: true,
            },
          },
        },
      }),

      prisma.interviewSession.count({
        where,
      }),
    ]);

    const result = {
      interviews: interviews.map(
        ({ feedback, ...interview }) => ({
          ...interview,
          hasFeedback: feedback !== null,
        }),
      ),
      total,
      page: params.page,
      pageSize: params.pageSize,
      pageCount: Math.ceil(total / params.pageSize),
    };

    logger.debug(
      {
        action: "interviews_list_loaded",
        durationMs: Date.now() - startedAt,
        page: params.page,
        pageSize: params.pageSize,
        resultCount: result.interviews.length,
        total,
      },
      "Interview list loaded.",
    );

    return result;
  } catch (error) {
    logger.error(
      {
        action: "interviews_list_load_failed",
        durationMs: Date.now() - startedAt,
        err: error,
      },
      "Failed to load interview list.",
    );

    throw new Error("Unable to load interviews.");
  }
}