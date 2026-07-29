import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import type {
  ActivityListData,
  ActivityListParams,
  ActivitySortDirection,
} from "@/features/activity/types/activity";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

function createOrderBy(
  sortBy: ActivityListParams["sortBy"],
  sortDirection: ActivitySortDirection,
): Prisma.AuditLogOrderByWithRelationInput {
  switch (sortBy) {
    case "action":
      return {
        action: sortDirection,
      };

    case "level":
      return {
        level: sortDirection,
      };

    case "createdAt":
    default:
      return {
        createdAt: sortDirection,
      };
  }
}

function createWhere(
  params: ActivityListParams,
): Prisma.AuditLogWhereInput {
  const query = params.query.trim();

  return {
    ...(params.level === "ALL"
      ? {}
      : {
          level: params.level,
        }),

    ...(query
      ? {
          OR: [
            {
              message: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              action: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              entityType: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              entityId: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              user: {
                is: {
                  OR: [
                    {
                      name: {
                        contains: query,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      email: {
                        contains: query,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };
}

export async function getActivityLogs(
  params: ActivityListParams,
): Promise<ActivityListData> {
  const startedAt = performance.now();
  const where = createWhere(params);
  const skip = (params.page - 1) * params.pageSize;

  try {
    const [activities, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: createOrderBy(
          params.sortBy,
          params.sortDirection,
        ),
        skip,
        take: params.pageSize,
        select: {
          id: true,
          level: true,
          action: true,
          entityType: true,
          entityId: true,
          message: true,
          metadata: true,
          ipAddress: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      prisma.auditLog.count({
        where,
      }),
    ]);

    const pageCount = Math.ceil(
      total / params.pageSize,
    );

    logger.debug(
      {
        action: "activity_logs_loaded",
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        page: params.page,
        pageSize: params.pageSize,
        resultCount: activities.length,
        total,
      },
      "Activity logs loaded.",
    );

    return {
      activities,
      page: params.page,
      pageCount,
      pageSize: params.pageSize,
      total,
    };
  } catch (error) {
    logger.error(
      {
        action: "activity_logs_failed",
        err: error,
        page: params.page,
        pageSize: params.pageSize,
      },
      "Unable to load activity logs.",
    );

    throw new Error("Unable to load activity logs.");
  }
}