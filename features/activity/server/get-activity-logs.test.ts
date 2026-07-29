import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ActivityListParams } from "@/features/activity/types/activity";
import {
  AuditLevel,
} from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    auditLog: {
      count: mocks.count,
      findMany: mocks.findMany,
    },
  },
}));

vi.mock("@/lib/logging/logger", () => ({
  logger: {
    debug: mocks.debug,
    error: mocks.error,
  },
}));

import { getActivityLogs } from "@/features/activity/server/get-activity-logs";

const defaultParams: ActivityListParams = {
  query: "",
  level: "ALL",
  page: 1,
  pageSize: 10,
  sortBy: "createdAt",
  sortDirection: "desc",
};

const activity = {
  id: "activity-1",
  level: AuditLevel.INFO,
  action: "candidate_created",
  entityType: "Candidate",
  entityId: "candidate-1",
  message: "Candidate profile created.",
  metadata: {
    targetRole: "Frontend Engineer",
  },
  ipAddress: "127.0.0.1",
  createdAt: new Date("2026-07-29T07:00:00.000Z"),
  user: {
    id: "user-1",
    name: "Main Interviewer",
    email: "interviewer@example.com",
  },
};

describe("getActivityLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a paginated activity list", async () => {
    mocks.findMany.mockResolvedValue([activity]);
    mocks.count.mockResolvedValue(12);

    const result = await getActivityLogs(defaultParams);

    expect(result).toEqual({
      activities: [activity],
      page: 1,
      pageCount: 2,
      pageSize: 10,
      total: 12,
    });

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: {
        createdAt: "desc",
      },
      skip: 0,
      take: 10,
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
    });

    expect(mocks.count).toHaveBeenCalledWith({
      where: {},
    });

    expect(mocks.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "activity_logs_loaded",
        page: 1,
        pageSize: 10,
        resultCount: 1,
        total: 12,
      }),
      "Activity logs loaded.",
    );
  });

  it("applies search and level filtering", async () => {
    mocks.findMany.mockResolvedValue([activity]);
    mocks.count.mockResolvedValue(1);

    await getActivityLogs({
      ...defaultParams,
      query: "candidate",
      level: AuditLevel.WARNING,
      sortBy: "action",
      sortDirection: "asc",
    });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          level: AuditLevel.WARNING,
          OR: [
            {
              message: {
                contains: "candidate",
                mode: "insensitive",
              },
            },
            {
              action: {
                contains: "candidate",
                mode: "insensitive",
              },
            },
            {
              entityType: {
                contains: "candidate",
                mode: "insensitive",
              },
            },
            {
              entityId: {
                contains: "candidate",
                mode: "insensitive",
              },
            },
            {
              user: {
                is: {
                  OR: [
                    {
                      name: {
                        contains: "candidate",
                        mode: "insensitive",
                      },
                    },
                    {
                      email: {
                        contains: "candidate",
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        orderBy: {
          action: "asc",
        },
      }),
    );

    expect(mocks.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        level: AuditLevel.WARNING,
      }),
    });
  });

  it("supports level sorting and later pages", async () => {
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(14);

    const result = await getActivityLogs({
      ...defaultParams,
      page: 3,
      pageSize: 5,
      sortBy: "level",
      sortDirection: "asc",
    });

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          level: "asc",
        },
        skip: 10,
        take: 5,
      }),
    );

    expect(result).toEqual({
      activities: [],
      page: 3,
      pageCount: 3,
      pageSize: 5,
      total: 14,
    });
  });

  it("handles an empty activity log", async () => {
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);

    await expect(
      getActivityLogs(defaultParams),
    ).resolves.toEqual({
      activities: [],
      page: 1,
      pageCount: 0,
      pageSize: 10,
      total: 0,
    });
  });

  it("logs failures and throws a safe error", async () => {
    const databaseError = new Error(
      "Database unavailable",
    );

    mocks.findMany.mockRejectedValue(databaseError);
    mocks.count.mockResolvedValue(0);

    await expect(
      getActivityLogs(defaultParams),
    ).rejects.toThrow(
      "Unable to load activity logs.",
    );

    expect(mocks.error).toHaveBeenCalledWith(
      {
        action: "activity_logs_failed",
        err: databaseError,
        page: 1,
        pageSize: 10,
      },
      "Unable to load activity logs.",
    );
  });
});