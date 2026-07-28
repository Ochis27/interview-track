import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { InterviewsTable } from "@/features/interviews/components/interviews-table";
import type { InterviewListData } from "@/features/interviews/types/interview";
import {
  InterviewStatus,
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";

const navigation = vi.hoisted(() => ({
  pathname: "/interviews",
  replace: vi.fn(),
  search: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({
    replace: navigation.replace,
  }),
  useSearchParams: () =>
    new URLSearchParams(navigation.search),
}));

vi.mock(
  "@/features/interviews/components/interviews-table-toolbar",
  () => ({
    InterviewsTableToolbar: ({
      onQueryChange,
      onStatusChange,
    }: {
      onQueryChange: (query: string) => void;
      onStatusChange: (status: string) => void;
    }) => (
      <div>
        <button onClick={() => onQueryChange("Ada")}>
          Search Ada
        </button>
        <button onClick={() => onQueryChange("")}>
          Clear query
        </button>
        <button
          onClick={() => onStatusChange("COMPLETED")}
        >
          Completed status
        </button>
        <button onClick={() => onStatusChange("ALL")}>
          All statuses
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "@/features/interviews/components/interviews-table-pagination",
  () => ({
    InterviewsTablePagination: ({
      onPageChange,
    }: {
      onPageChange: (page: number) => void;
    }) => (
      <div>
        <button onClick={() => onPageChange(1)}>
          First page
        </button>
        <button onClick={() => onPageChange(2)}>
          Second page
        </button>
      </div>
    ),
  }),
);

const data: InterviewListData = {
  interviews: [
    {
      id: "interview-1",
      title: "Frontend interview",
      type: InterviewType.TECHNICAL,
      status: InterviewStatus.SCHEDULED,
      scheduledAt: new Date(2026, 6, 30, 14, 30),
      durationMinutes: 60,
      completedAt: null,
      hasFeedback: false,
      candidate: {
        id: "candidate-1",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        seniority: SeniorityLevel.SENIOR,
      },
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
  pageCount: 1,
};

const defaultParams = {
  query: "",
  status: "ALL" as const,
  sortBy: "scheduledAt" as const,
  sortDirection: "desc" as const,
};

describe("InterviewsTable", () => {
  beforeEach(() => {
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("renders interviews and changes sorting", async () => {
    const user = userEvent.setup();

    render(
      <InterviewsTable
        data={data}
        params={defaultParams}
      />,
    );

    expect(
      screen.getByText("Frontend interview"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace"))
      .toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Interview",
      }),
    );

    expect(navigation.replace).toHaveBeenCalledWith(
      "/interviews?sortBy=title&sortDirection=asc",
    );
  });

  it("reverses an active ascending sort", async () => {
    const user = userEvent.setup();

    render(
      <InterviewsTable
        data={data}
        params={{
          ...defaultParams,
          sortDirection: "asc",
        }}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Scheduled for",
      }),
    );

    expect(navigation.replace).toHaveBeenCalledWith(
      "/interviews?sortBy=scheduledAt&sortDirection=desc",
    );
  });

  it("updates filters and pagination in the URL", async () => {
    const user = userEvent.setup();
    navigation.search = "page=3";

    render(
      <InterviewsTable
        data={data}
        params={defaultParams}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Search Ada" }),
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/interviews?query=Ada",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Completed status",
      }),
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/interviews?status=COMPLETED",
    );

    await user.click(
      screen.getByRole("button", {
        name: "All statuses",
      }),
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/interviews",
    );

    await user.click(
      screen.getByRole("button", { name: "First page" }),
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/interviews",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Second page",
      }),
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/interviews?page=2",
    );
  });

  it("renders an empty state", () => {
    render(
      <InterviewsTable
        data={{
          ...data,
          interviews: [],
          total: 0,
          pageCount: 0,
        }}
        params={defaultParams}
      />,
    );

    expect(
      screen.getByText("No interviews found"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try changing the search or status filter, or schedule a new interview.",
      ),
    ).toBeInTheDocument();
  });
});