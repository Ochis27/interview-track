"use no memo";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { activityContent } from "@/content/activity";
import {
  createActivityColumns,
  type ActivityColumnsOptions,
} from "@/features/activity/components/activity-columns";
import type { ActivityLogItem } from "@/features/activity/types/activity";
import { AuditLevel } from "@/generated/prisma/enums";

type ActivityColumnsHarnessProps =
  ActivityColumnsOptions & {
    activities: ActivityLogItem[];
  };

function ActivityColumnsHarness({
  activities,
  sortBy,
  sortDirection,
  onSort,
}: ActivityColumnsHarnessProps) {
  const columns = createActivityColumns({
    sortBy,
    sortDirection,
    onSort,
  });

  // TanStack Table exposes mutable functions that cannot
  // safely be memoized by the React Compiler.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: activities,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext(),
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const activity: ActivityLogItem = {
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
  createdAt: new Date(2026, 6, 29, 10, 15, 30),
  user: {
    id: "user-1",
    name: "Main Interviewer",
    email: "interviewer@example.com",
  },
};

describe("createActivityColumns", () => {
  it("renders column labels and activity information", () => {
    render(
      <ActivityColumnsHarness
        activities={[
          activity,
          {
            ...activity,
            id: "activity-2",
            level: AuditLevel.ERROR,
            entityId: null,
            ipAddress: null,
            message: "Unable to persist feedback.",
            user: null,
          },
        ]}
        onSort={vi.fn()}
        sortBy="createdAt"
        sortDirection="desc"
      />,
    );

    expect(
      screen.getByRole("button", {
        name: activityContent.table.columns.level,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        activityContent.table.columns.message,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: activityContent.table.columns.action,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        activityContent.table.columns.entity,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        activityContent.table.columns.actor,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        activityContent.table.columns.ipAddress,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: activityContent.table.columns.createdAt,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Candidate profile created."),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("candidate_created"),
    ).toHaveLength(2);

    expect(
      screen.getAllByText("Candidate"),
    ).toHaveLength(2);

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
      screen.getAllByText(
        activityContent.table.unknownValue,
      ),
    ).toHaveLength(2);

    expect(
      screen.getByText(
        activityContent.table.systemActor,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(
        "Jul 29, 2026, 10:15:30",
      ),
    ).toHaveLength(2);

    expect(
      screen.getByText("Information"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Error"),
    ).toBeInTheDocument();
  });

  it("calls the sorting handler for sortable columns", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    const { rerender } = render(
      <ActivityColumnsHarness
        activities={[activity]}
        onSort={onSort}
        sortBy="createdAt"
        sortDirection="desc"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: activityContent.table.columns.level,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: activityContent.table.columns.action,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: activityContent.table.columns.createdAt,
      }),
    );

    expect(onSort).toHaveBeenNthCalledWith(
      1,
      "level",
    );

    expect(onSort).toHaveBeenNthCalledWith(
      2,
      "action",
    );

    expect(onSort).toHaveBeenNthCalledWith(
      3,
      "createdAt",
    );

    rerender(
      <ActivityColumnsHarness
        activities={[activity]}
        onSort={onSort}
        sortBy="level"
        sortDirection="asc"
      />,
    );

    expect(
      screen.getByRole("button", {
        name: activityContent.table.columns.level,
      }),
    ).toBeInTheDocument();
  });
});