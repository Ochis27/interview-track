import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  activityContent,
  auditLevelLabels,
} from "@/content/activity";
import type {
  ActivityLogItem,
  ActivitySortDirection,
  ActivitySortField,
} from "@/features/activity/types/activity";
import { AuditLevel } from "@/generated/prisma/enums";

export type ActivityColumnsOptions = {
  sortBy: ActivitySortField;
  sortDirection: ActivitySortDirection;
  onSort: (field: ActivitySortField) => void;
};

type SortHeaderProps = {
  active: boolean;
  direction: ActivitySortDirection;
  label: string;
  onClick: () => void;
};

const levelStyles = {
  [AuditLevel.INFO]:
    "border-blue-200 bg-blue-50 text-blue-700",
  [AuditLevel.WARNING]:
    "border-amber-200 bg-amber-50 text-amber-700",
  [AuditLevel.ERROR]:
    "border-red-200 bg-red-50 text-red-700",
} satisfies Record<AuditLevel, string>;

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
      <Icon
        aria-hidden="true"
        className="size-4"
      />
    </Button>
  );
}

export function createActivityColumns({
  sortBy,
  sortDirection,
  onSort,
}: ActivityColumnsOptions): ColumnDef<ActivityLogItem>[] {
  const content = activityContent.table;
  const columns = content.columns;

  return [
    {
      accessorKey: "level",
      header: () => (
        <SortHeader
          active={sortBy === "level"}
          direction={sortDirection}
          label={columns.level}
          onClick={() => onSort("level")}
        />
      ),
      cell: ({ row }) => (
        <Badge
          className={levelStyles[row.original.level]}
          variant="outline"
        >
          {auditLevelLabels[row.original.level]}
        </Badge>
      ),
    },
    {
      accessorKey: "message",
      header: columns.message,
      cell: ({ row }) => (
        <p className="min-w-56 max-w-md font-medium text-foreground">
          {row.original.message}
        </p>
      ),
    },
    {
      accessorKey: "action",
      header: () => (
        <SortHeader
          active={sortBy === "action"}
          direction={sortDirection}
          label={columns.action}
          onClick={() => onSort("action")}
        />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-xs text-foreground">
          {row.original.action}
        </code>
      ),
    },
    {
      id: "entity",
      header: columns.entity,
      cell: ({ row }) => (
        <div className="min-w-40">
          <p className="font-medium text-foreground">
            {row.original.entityType}
          </p>

          <p className="max-w-48 truncate text-xs text-muted-foreground">
            {row.original.entityId ??
              content.unknownValue}
          </p>
        </div>
      ),
    },
    {
      id: "actor",
      header: columns.actor,
      cell: ({ row }) => {
        const actor = row.original.user;

        if (!actor) {
          return (
            <span className="text-sm text-muted-foreground">
              {content.systemActor}
            </span>
          );
        }

        return (
          <div className="min-w-44">
            <p className="font-medium text-foreground">
              {actor.name}
            </p>

            <p className="text-xs text-muted-foreground">
              {actor.email}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: columns.ipAddress,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.ipAddress ??
            content.unknownValue}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortHeader
          active={sortBy === "createdAt"}
          direction={sortDirection}
          label={columns.createdAt}
          onClick={() => onSort("createdAt")}
        />
      ),
      cell: ({ row }) => (
        <time
          className="whitespace-nowrap text-sm"
          dateTime={row.original.createdAt.toISOString()}
        >
          {format(
            row.original.createdAt,
            "MMM d, yyyy, HH:mm:ss",
          )}
        </time>
      ),
    },
  ];
}