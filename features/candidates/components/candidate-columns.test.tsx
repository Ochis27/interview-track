import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";

import {
  createCandidateColumns,
  type CandidateSortField,
} from "@/features/candidates/components/candidate-columns";
import type { CandidateListItem } from "@/features/candidates/types/candidate";

type ColumnsHarnessProps = {
  direction?: "asc" | "desc";
  onSort: (field: CandidateSortField) => void;
  sortBy?: CandidateSortField;
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
    interviewCount: 2,
    createdAt: new Date("2026-01-15T10:00:00.000Z"),
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
    interviewCount: 1,
    createdAt: new Date("2026-02-20T10:00:00.000Z"),
  },
];

function ColumnsHarness({
  direction = "desc",
  onSort,
  sortBy = "createdAt",
}: ColumnsHarnessProps) {
  "use no memo";

  const columns = createCandidateColumns({
    direction,
    onSort,
    sortBy,
  });

  // TanStack Table v8 relies on interior mutability.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: candidates,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
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

describe("createCandidateColumns", () => {
  it("renders all column labels and candidate values", () => {
    render(<ColumnsHarness onSort={vi.fn()} />);

    expect(screen.getByText("Candidate")).toBeInTheDocument();
    expect(screen.getByText("Target role")).toBeInTheDocument();
    expect(screen.getByText("Seniority")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Interviews")).toBeInTheDocument();
    expect(screen.getByText("Added")).toBeInTheDocument();

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Middle")).toBeInTheDocument();
    expect(screen.getByText("5 years")).toBeInTheDocument();

    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("ARCHITECT")).toBeInTheDocument();
    expect(screen.getAllByText("Not provided")).toHaveLength(2);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("calls the sorting handler for sortable columns", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(<ColumnsHarness onSort={onSort} />);

    await user.click(
      screen.getByRole("button", { name: "Sort by Candidate" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Sort by Seniority" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Sort by Added" }),
    );

    expect(onSort).toHaveBeenNthCalledWith(1, "name");
    expect(onSort).toHaveBeenNthCalledWith(2, "seniority");
    expect(onSort).toHaveBeenNthCalledWith(3, "createdAt");
  });

  it("renders inactive, ascending, and descending sort icons", () => {
    const { container, rerender } = render(
      <ColumnsHarness
        direction="desc"
        onSort={vi.fn()}
        sortBy="createdAt"
      />,
    );

    expect(
      container.querySelector(".lucide-arrow-down"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".lucide-arrow-up-down"),
    ).toBeInTheDocument();

    rerender(
      <ColumnsHarness
        direction="asc"
        onSort={vi.fn()}
        sortBy="createdAt"
      />,
    );

    expect(
      container.querySelector(".lucide-arrow-up"),
    ).toBeInTheDocument();
  });
});