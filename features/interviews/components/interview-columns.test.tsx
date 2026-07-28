import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  createInterviewColumns,
  type InterviewSortField,
} from "@/features/interviews/components/interview-columns";
import type { InterviewListItem } from "@/features/interviews/types/interview";
import {
  InterviewStatus,
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";

const interviews: InterviewListItem[] = [
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
  {
    id: "interview-2",
    title: "Coding exercise",
    type: InterviewType.CODING,
    status: InterviewStatus.COMPLETED,
    scheduledAt: new Date(2026, 6, 29, 10),
    durationMinutes: 45,
    completedAt: new Date(2026, 6, 29, 10, 45),
    hasFeedback: true,
    candidate: {
      id: "candidate-2",
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
      seniority: SeniorityLevel.LEAD,
    },
  },
];

type ColumnsHarnessProps = {
  sortBy: InterviewSortField;
  sortDirection: "asc" | "desc";
  onSort: (field: InterviewSortField) => void;
};

function ColumnsHarness({
  sortBy,
  sortDirection,
  onSort,
}: ColumnsHarnessProps) {
  const columns = createInterviewColumns({
    sortBy,
    sortDirection,
    onSort,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: interviews,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                {flexRender(
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

describe("createInterviewColumns", () => {
  it("renders interview and candidate information", () => {
    render(
      <ColumnsHarness
        onSort={vi.fn()}
        sortBy="title"
        sortDirection="asc"
      />,
    );

    expect(
      screen.getByText("Frontend interview"),
    ).toBeInTheDocument();
    expect(screen.getByText("Technical")).toBeInTheDocument();
    expect(screen.getByText("Coding")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace"))
      .toBeInTheDocument();
    expect(screen.getByText("grace@example.com"))
      .toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("60 min")).toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();
    expect(screen.getByText("Not submitted"))
      .toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
  });

  it("calls the sorting handler", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    const { rerender } = render(
      <ColumnsHarness
        onSort={onSort}
        sortBy="title"
        sortDirection="asc"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Interview",
      }),
    );

    expect(onSort).toHaveBeenCalledWith("title");

    rerender(
      <ColumnsHarness
        onSort={onSort}
        sortBy="status"
        sortDirection="desc"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Status",
      }),
    );

    expect(onSort).toHaveBeenCalledWith("status");

    await user.click(
      screen.getByRole("button", {
        name: "Scheduled for",
      }),
    );

    expect(onSort).toHaveBeenCalledWith("scheduledAt");
  });
});