import {
  describe,
  expect,
  it,
} from "vitest";

import {
  parseCandidateListParams,
} from "@/features/candidates/schemas/candidate-list-params";

describe("parseCandidateListParams", () => {
  it("returns safe defaults for missing values", () => {
    expect(
      parseCandidateListParams({}),
    ).toEqual({
      query: "",
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  });

  it("normalizes valid URL parameters", () => {
    expect(
      parseCandidateListParams({
        query: ["  Ana  "],
        page: ["2"],
        pageSize: ["20"],
        sortBy: ["name"],
        sortDirection: ["asc"],
      }),
    ).toEqual({
      query: "Ana",
      page: 2,
      pageSize: 20,
      sortBy: "name",
      sortDirection: "asc",
    });
  });

  it("replaces invalid values with defaults", () => {
    expect(
      parseCandidateListParams({
        query: "a".repeat(101),
        page: "invalid",
        pageSize: "200",
        sortBy: "email",
        sortDirection: "up",
      }),
    ).toEqual({
      query: "",
      page: 1,
      pageSize: 10,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  });
});