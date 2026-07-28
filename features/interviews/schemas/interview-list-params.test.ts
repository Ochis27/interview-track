import { describe, expect, it } from "vitest";

import {
  interviewListParamsSchema,
  parseInterviewListParams,
} from "@/features/interviews/schemas/interview-list-params";
import { InterviewStatus } from "@/generated/prisma/enums";

describe("interviewListParamsSchema", () => {
  it("returns the default list parameters", () => {
    const result = interviewListParamsSchema.parse({});

    expect(result).toEqual({
      query: "",
      status: "ALL",
      page: 1,
      pageSize: 10,
      sortBy: "scheduledAt",
      sortDirection: "desc",
    });
  });

  it("parses valid interview list parameters", () => {
    const result = parseInterviewListParams({
      query: "  Alice interview  ",
      status: InterviewStatus.COMPLETED,
      page: "2",
      pageSize: "20",
      sortBy: "title",
      sortDirection: "asc",
    });

    expect(result).toEqual({
      query: "Alice interview",
      status: InterviewStatus.COMPLETED,
      page: 2,
      pageSize: 20,
      sortBy: "title",
      sortDirection: "asc",
    });
  });

  it("uses the first value from array parameters", () => {
    const result = parseInterviewListParams({
      query: ["technical", "ignored"],
      status: [InterviewStatus.SCHEDULED, "ALL"],
      page: ["3", "4"],
      pageSize: ["5", "10"],
      sortBy: ["status", "title"],
      sortDirection: ["desc", "asc"],
    });

    expect(result).toEqual({
      query: "technical",
      status: InterviewStatus.SCHEDULED,
      page: 3,
      pageSize: 5,
      sortBy: "status",
      sortDirection: "desc",
    });
  });

  it("falls back when parameters are invalid", () => {
    const result = parseInterviewListParams({
      query: "a".repeat(101),
      status: "UNKNOWN",
      page: "-2",
      pageSize: "200",
      sortBy: "unknown",
      sortDirection: "sideways",
    });

    expect(result).toEqual({
      query: "",
      status: "ALL",
      page: 1,
      pageSize: 10,
      sortBy: "scheduledAt",
      sortDirection: "desc",
    });
  });
});