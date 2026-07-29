import { describe, expect, it } from "vitest";

import { parseActivityListParams } from "@/features/activity/schemas/activity-list-params";
import { AuditLevel } from "@/generated/prisma/enums";

describe("parseActivityListParams", () => {
  it("returns the default activity list parameters", () => {
    expect(parseActivityListParams({})).toEqual({
      query: "",
      level: "ALL",
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  });

  it("parses valid activity list parameters", () => {
    expect(
      parseActivityListParams({
        query: "  candidate created  ",
        level: AuditLevel.WARNING,
        page: "2",
        pageSize: "20",
        sortBy: "action",
        sortDirection: "asc",
      }),
    ).toEqual({
      query: "candidate created",
      level: AuditLevel.WARNING,
      page: 2,
      pageSize: 20,
      sortBy: "action",
      sortDirection: "asc",
    });
  });

  it("uses the first value from repeated search parameters", () => {
    expect(
      parseActivityListParams({
        query: ["feedback", "candidate"],
        level: [
          AuditLevel.ERROR,
          AuditLevel.INFO,
        ],
        page: ["3", "4"],
        pageSize: ["25", "10"],
        sortBy: ["level", "createdAt"],
        sortDirection: ["asc", "desc"],
      }),
    ).toEqual({
      query: "feedback",
      level: AuditLevel.ERROR,
      page: 3,
      pageSize: 25,
      sortBy: "level",
      sortDirection: "asc",
    });
  });

  it("falls back safely for invalid parameters", () => {
    expect(
      parseActivityListParams({
        level: "CRITICAL",
        page: "0",
        pageSize: "100",
        sortBy: "message",
        sortDirection: "sideways",
      }),
    ).toEqual({
      query: "",
      level: "ALL",
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  });
});