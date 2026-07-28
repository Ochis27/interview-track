"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { candidatesContent } from "@/content/candidates";
import type { CandidateListItem } from "@/features/candidates/types/candidate";

export type CandidateSortField =
  | "name"
  | "createdAt"
  | "seniority";

type CandidateColumnsOptions = {
  sortBy: CandidateSortField;
  direction: "asc" | "desc";
  onSort: (field: CandidateSortField) => void;
};

function getSeniorityLabel(value: string): string {
  const labels: Record<string, string> = candidatesContent.seniority;

  return labels[value] ?? value;
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  if (!active) {
    return <ArrowUpDown aria-hidden="true" className="size-4" />;
  }

  return direction === "asc" ? (
    <ArrowUp aria-hidden="true" className="size-4" />
  ) : (
    <ArrowDown aria-hidden="true" className="size-4" />
  );
}

function SortableHeader({
  field,
  label,
  options,
}: {
  field: CandidateSortField;
  label: string;
  options: CandidateColumnsOptions;
}) {
  const active = options.sortBy === field;

  return (
    <Button
      aria-label={`${candidatesContent.table.sortByLabel} ${label}`}
      className="-ml-3 gap-2"
      onClick={() => options.onSort(field)}
      type="button"
      variant="ghost"
    >
      {label}
      <SortIcon active={active} direction={options.direction} />
    </Button>
  );
}

export function createCandidateColumns(
  options: CandidateColumnsOptions,
): ColumnDef<CandidateListItem>[] {
  const columns = candidatesContent.table.columns;

  return [
    {
      id: "name",
      header: () => (
        <SortableHeader
          field="name"
          label={columns.name}
          options={options}
        />
      ),
      cell: ({ row }) => {
        const candidate = row.original;

        return (
          <div className="min-w-48">
            <p className="font-medium text-foreground">
              {candidate.firstName} {candidate.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {candidate.email}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "targetRole",
      header: columns.targetRole,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.targetRole}</p>
          <p className="text-sm text-muted-foreground">
            {row.original.currentRole ??
              candidatesContent.table.notProvided}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "seniority",
      header: () => (
        <SortableHeader
          field="seniority"
          label={columns.seniority}
          options={options}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {getSeniorityLabel(row.original.seniority)}
        </Badge>
      ),
    },
    {
      accessorKey: "yearsExperience",
      header: columns.experience,
      cell: ({ row }) => {
        const years = row.original.yearsExperience;

        return years === null
          ? candidatesContent.table.notProvided
          : `${years} ${candidatesContent.table.yearsSuffix}`;
      },
    },
    {
      accessorKey: "interviewCount",
      header: columns.interviews,
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortableHeader
          field="createdAt"
          label={columns.createdAt}
          options={options}
        />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
        }).format(row.original.createdAt),
    },
  ];
}