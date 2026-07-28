import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CandidatesTable } from "@/features/candidates/components/candidates-table";
import type { CandidateListParams } from "@/features/candidates/schemas/candidate-list-params";
import type {
  CandidateListData,
  CandidateListItem,
} from "@/features/candidates/types/candidate";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  queryString: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/candidates",
  useRouter: () => ({
    push: navigation.push,
  }),
  useSearchParams: () =>
    new URLSearchParams(navigation.queryString),
}));

const defaultParams: CandidateListParams = {
  query: "",
  page: 1,
  pageSize: 10,
  sortBy: "createdAt",
  sortDirection: "desc",
};

const candidates: CandidateListItem[] = [
  {
    id: "candidate-1",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    currentRole: "Frontend Developer",
    targetRole: "Senior Engineer",
    seniority: "MIDDLE",
    yearsExperience: 5,
    createdAt: new Date("2026-01-15T10:00:00.000Z"),
    interviewCount: 2,
  },
  {
    id: "candidate-2",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@example.com",
    currentRole: null,
    targetRole: "Engineering Lead",
    seniority: "ARCHITECT" as CandidateListItem["seniority"],
    yearsExperience: null,
    createdAt: new Date("2026-02-20T10:00:00.000Z"),
    interviewCount: 1,
  },
];

function createData(
  overrides: Partial<CandidateListData> = {},
): CandidateListData {
  return {
    candidates,
    total: 2,
    page: 1,
    pageSize: 10,
    pageCount: 2,
    ...overrides,
  };
}

function expectNavigation(
  expectedParams: Record<string, string>,
) {
  const lastCall = navigation.push.mock.lastCall;

  expect(lastCall).toBeDefined();

  const [destination, options] = lastCall as [
    string,
    { scroll: boolean },
  ];

  const [pathname, queryString = ""] = destination.split("?");

  expect(pathname).toBe("/candidates");
  expect(options).toEqual({ scroll: false });
  expect(Object.fromEntries(new URLSearchParams(queryString))).toEqual(
    expectedParams,
  );
}

describe("CandidatesTable", () => {
  beforeEach(() => {
    navigation.push.mockReset();
    navigation.queryString = "";
  });

  it("renders candidate information and column content", () => {
    render(
      <CandidatesTable
        data={createData()}
        params={defaultParams}
      />,
    );

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Middle")).toBeInTheDocument();
    expect(screen.getByText("5 years")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getAllByText("Not provided")).toHaveLength(2);
    expect(screen.getByText("ARCHITECT")).toBeInTheDocument();
    expect(screen.getByText("2 candidates")).toBeInTheDocument();
  });

  it("searches for candidates and clears an active search", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CandidatesTable
        data={createData()}
        params={defaultParams}
      />,
    );

    await user.type(
      screen.getByLabelText("Search candidates"),
      "Alice",
    );
    await user.click(
      screen.getByRole("button", { name: "Search" }),
    );

    expectNavigation({ query: "Alice" });

    navigation.queryString = "query=Alice&page=2";

    rerender(
      <CandidatesTable
        data={createData()}
        params={{
          ...defaultParams,
          query: "Alice",
          page: 2,
        }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Clear" }),
    );

    expectNavigation({});
  });

  it("changes server-side sorting through the URL", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CandidatesTable
        data={createData()}
        params={defaultParams}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Sort by Added" }),
    );

    expectNavigation({
      sortBy: "createdAt",
      sortDirection: "asc",
    });

    rerender(
      <CandidatesTable
        data={createData()}
        params={{
          ...defaultParams,
          sortDirection: "asc",
        }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Sort by Added" }),
    );

    expectNavigation({
      sortBy: "createdAt",
      sortDirection: "desc",
    });

    await user.click(
      screen.getByRole("button", { name: "Sort by Candidate" }),
    );

    expectNavigation({
      sortBy: "name",
      sortDirection: "asc",
    });
  });

  it("navigates between pages and disables boundary actions", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CandidatesTable
        data={createData({ page: 2, pageCount: 3 })}
        params={{ ...defaultParams, page: 2 }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Previous" }),
    );
    expectNavigation({ page: "1" });

    await user.click(screen.getByRole("button", { name: "Next" }));
    expectNavigation({ page: "3" });

    rerender(
      <CandidatesTable
        data={createData({ page: 1, pageCount: 3 })}
        params={defaultParams}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeDisabled();

    rerender(
      <CandidatesTable
        data={createData({ page: 3, pageCount: 3 })}
        params={{ ...defaultParams, page: 3 }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Next" }),
    ).toBeDisabled();
  });

  it("renders the empty state and handles an empty search", async () => {
    const user = userEvent.setup();

    render(
      <CandidatesTable
        data={createData({
          candidates: [],
          total: 0,
          pageCount: 0,
        })}
        params={defaultParams}
      />,
    );

    expect(screen.getByText("No candidates found")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Search" }),
    );

    expectNavigation({});
  });
});