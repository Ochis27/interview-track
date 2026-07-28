import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  interviewsContent,
  interviewStatusLabels,
  interviewTypeLabels,
} from "@/content/interviews";
import type { InterviewListItem } from "@/features/interviews/types/interview";
import { InterviewStatus } from "@/generated/prisma/enums";

export type InterviewSortField =
  | "title"
  | "status"
  | "scheduledAt"
  | "createdAt";

type InterviewColumnsOptions = {
  sortBy: InterviewSortField;
  sortDirection: "asc" | "desc";
  onSort: (field: InterviewSortField) => void;
};

type SortHeaderProps = {
  active: boolean;
  direction: "asc" | "desc";
  label: string;
  onClick: () => void;
};

const statusStyles = {
  [InterviewStatus.SCHEDULED]:
    "border-blue-200 bg-blue-50 text-blue-700",
  [InterviewStatus.IN_PROGRESS]:
    "border-amber-200 bg-amber-50 text-amber-700",
  [InterviewStatus.COMPLETED]:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  [InterviewStatus.CANCELLED]:
    "border-slate-200 bg-slate-50 text-slate-600",
} satisfies Record<InterviewStatus, string>;

function SortHeader({
  active,
  direction,
  label,
  onClick,
}: SortHeaderProps) {
  const Icon = active
    ? direction === "asc"
      ? ArrowUp
      : ArrowDown
    : ChevronsUpDown;

  return (
    <Button
      className="-ml-3 h-8"
      onClick={onClick}
      type="button"
      variant="ghost"
    >
      {label}
      <Icon aria-hidden="true" className="size-4" />
    </Button>
  );
}

export function createInterviewColumns({
  sortBy,
  sortDirection,
  onSort,
}: InterviewColumnsOptions): ColumnDef<InterviewListItem>[] {
  const columns = interviewsContent.table.columns;

  return [
    {
      accessorKey: "title",
      header: () => (
        <SortHeader
          active={sortBy === "title"}
          direction={sortDirection}
          label={columns.title}
          onClick={() => onSort("title")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-44">
          <p className="font-medium text-foreground">
            {row.original.title}
          </p>
          <Badge className="mt-1" variant="outline">
            {interviewTypeLabels[row.original.type]}
          </Badge>
        </div>
      ),
    },
    {
      id: "candidate",
      header: columns.candidate,
      cell: ({ row }) => {
        const { candidate } = row.original;

        return (
          <div className="min-w-44">
            <p className="font-medium text-foreground">
              {candidate.firstName} {candidate.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {candidate.email}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <SortHeader
          active={sortBy === "status"}
          direction={sortDirection}
          label={columns.status}
          onClick={() => onSort("status")}
        />
      ),
      cell: ({ row }) => (
        <Badge
          className={statusStyles[row.original.status]}
          variant="outline"
        >
          {interviewStatusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "scheduledAt",
      header: () => (
        <SortHeader
          active={sortBy === "scheduledAt"}
          direction={sortDirection}
          label={columns.scheduledAt}
          onClick={() => onSort("scheduledAt")}
        />
      ),
      cell: ({ row }) => (
        <time dateTime={row.original.scheduledAt.toISOString()}>
          {format(
            row.original.scheduledAt,
            "MMM d, yyyy, HH:mm",
          )}
        </time>
      ),
    },
    {
      accessorKey: "durationMinutes",
      header: columns.duration,
      cell: ({ row }) => (
        <span>
          {row.original.durationMinutes}{" "}
          {interviewsContent.table.minutes}
        </span>
      ),
    },
    {
      accessorKey: "hasFeedback",
      header: columns.feedback,
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.hasFeedback ? "secondary" : "outline"
          }
        >
          {row.original.hasFeedback
            ? interviewsContent.table.feedbackAvailable
            : interviewsContent.table.feedbackMissing}
        </Badge>
      ),
    },
  ];
}