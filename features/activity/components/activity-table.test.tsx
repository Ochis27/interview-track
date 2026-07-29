import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { activityContent } from "@/content/activity";
import { ActivityTable } from "@/features/activity/components/activity-table";
import type {
  ActivityLevelFilter,
  ActivityListData,
  ActivityListParams,
} from "@/features/activity/types/activity";
import { AuditLevel } from "@/generated/prisma/enums";

const navigation = vi.hoisted(() => ({
  pathname: "/activity",
  replace: vi.fn(),
  searchParams: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,

  useRouter: () => ({
    replace: navigation.replace,
  }),

  useSearchParams: () =>
    new URLSearchParams(navigation.searchParams),
}));

vi.mock(
  "@/features/activity/components/activity-table-toolbar",
  () => ({
    ActivityTableToolbar: ({
      onLevelChange,
      onQueryChange,
    }: {
      level: ActivityLevelFilter;
      query: string;
      onLevelChange: (
        level: ActivityLevelFilter,
      ) => void;
      onQueryChange: (query: string) => void;
    }) => (
      <div>
        <button
          onClick={() =>
            onQueryChange("feedback")
          }
          type="button"
        >
          Apply activity query
        </button>

        <button
          onClick={() =>
            onLevelChange(AuditLevel.WARNING)
          }
          type="button"
        >
          Apply warning level
        </button>

        <button
          onClick={() => onLevelChange("ALL")}
          type="button"
        >
          Clear activity level
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "@/features/activity/components/activity-table-pagination",
  () => ({
    ActivityTablePagination: ({
      onPageChange,
    }: {
      page: number;
      pageCount: number;
      total: number;
      onPageChange: (page: number) => void;
    }) => (
      <div>
        <button
          onClick={() => onPageChange(1)}
          type="button"
        >
          Open first page
        </button>

        <button
          onClick={() => onPageChange(2)}
          type="button"
        >
          Open second page
        </button>
      </div>
    ),
  }),
);

const defaultParams: ActivityListParams = {
  query: "",
  level: "ALL",
  page: 1,
  pageSize: 10,
  sortBy: "createdAt",
  sortDirection: "desc",
};

const data: ActivityListData = {
  activities: [
    {
      id: "activity-1",
      level: AuditLevel.INFO,
      action: "candidate_created",
      entityType: "Candidate",
      entityId: "candidate-1",
      message: "Candidate profile created.",
      metadata: null,
      ipAddress: "127.0.0.1",
      createdAt: new Date(
        2026,
        6,
        29,
        10,
        15,
        30,
      ),
      user: {
        id: "user-1",
        name: "Main Interviewer",
        email: "interviewer@example.com",
      },
    },
  ],
  page: 1,
  pageCount: 1,
  pageSize: 10,
  total: 1,
};

describe("ActivityTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.pathname = "/activity";
    navigation.searchParams = "";
  });

  it("renders activity information and columns", () => {
    render(
      <ActivityTable
        data={data}
        params={defaultParams}
      />,
    );

    expect(
      screen.getByText(
        activityContent.table.caption,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Candidate profile created."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("candidate_created"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Candidate"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("candidate-1"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Main Interviewer"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("interviewer@example.com"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("127.0.0.1"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Jul 29, 2026, 10:15:30",
      ),
    ).toBeInTheDocument();
  });

  it("renders an empty state", () => {
    render(
      <ActivityTable
        data={{
          activities: [],
          page: 1,
          pageCount: 0,
          pageSize: 10,
          total: 0,
        }}
        params={defaultParams}
      />,
    );

    expect(
      screen.getByText(
        activityContent.table.emptyTitle,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        activityContent.table.emptyDescription,
      ),
    ).toBeInTheDocument();
  });

  it("changes server-side sorting through the URL", async () => {
    const user = userEvent.setup();

    navigation.searchParams =
      "query=candidate&page=2";

    render(
      <ActivityTable
        data={data}
        params={{
          ...defaultParams,
          query: "candidate",
          page: 2,
          sortDirection: "asc",
        }}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: activityContent.table.columns.createdAt,
      }),
    );

    expect(
      navigation.replace,
    ).toHaveBeenNthCalledWith(
      1,
      "/activity?query=candidate&sortBy=createdAt&sortDirection=desc",
    );

    await user.click(
      screen.getByRole("button", {
        name: activityContent.table.columns.action,
      }),
    );

    expect(
      navigation.replace,
    ).toHaveBeenNthCalledWith(
      2,
      "/activity?query=candidate&sortBy=action&sortDirection=asc",
    );
  });

  it("updates filters and pagination in the URL", async () => {
    const user = userEvent.setup();

    render(
      <ActivityTable
        data={data}
        params={defaultParams}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Apply activity query",
      }),
    );

    expect(
      navigation.replace,
    ).toHaveBeenNthCalledWith(
      1,
      "/activity?query=feedback",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Apply warning level",
      }),
    );

    expect(
      navigation.replace,
    ).toHaveBeenNthCalledWith(
      2,
      "/activity?level=WARNING",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Clear activity level",
      }),
    );

    expect(
      navigation.replace,
    ).toHaveBeenNthCalledWith(
      3,
      "/activity",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Open second page",
      }),
    );

    expect(
      navigation.replace,
    ).toHaveBeenNthCalledWith(
      4,
      "/activity?page=2",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Open first page",
      }),
    );

    expect(
      navigation.replace,
    ).toHaveBeenNthCalledWith(
      5,
      "/activity",
    );
  });
});