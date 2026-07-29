"use client";
"use no memo";

import { useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { activityContent } from "@/content/activity";
import {
  createActivityColumns,
} from "@/features/activity/components/activity-columns";
import { ActivityTablePagination } from "@/features/activity/components/activity-table-pagination";
import { ActivityTableToolbar } from "@/features/activity/components/activity-table-toolbar";
import type {
  ActivityListData,
  ActivityListParams,
  ActivitySortField,
} from "@/features/activity/types/activity";

type ActivityTableProps = {
  data: ActivityListData;
  params: ActivityListParams;
};

type UrlUpdates = Record<string, string | null>;

export function ActivityTable({
  data,
  params,
}: ActivityTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateUrl(updates: UrlUpdates) {
    const nextParams = new URLSearchParams(
      searchParams.toString(),
    );

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    }

    const queryString = nextParams.toString();
    const href = queryString
      ? `${pathname}?${queryString}`
      : pathname;

    startTransition(() => {
      router.replace(href);
    });
  }

  function handleSort(field: ActivitySortField) {
    const sortDirection =
      params.sortBy === field &&
      params.sortDirection === "asc"
        ? "desc"
        : "asc";

    updateUrl({
      sortBy: field,
      sortDirection,
      page: null,
    });
  }

  const columns = createActivityColumns({
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    onSort: handleSort,
  });

  // TanStack Table exposes mutable functions that cannot
  // safely be memoized by the React Compiler.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: data.activities,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: data.pageCount,
  });

  return (
    <section
      aria-busy={isPending}
      className="space-y-4"
    >
      <ActivityTableToolbar
        level={params.level}
        onLevelChange={(level) =>
          updateUrl({
            level:
              level === "ALL" ? null : level,
            page: null,
          })
        }
        onQueryChange={(query) =>
          updateUrl({
            query: query || null,
            page: null,
          })
        }
        query={params.query}
      />

      <div
        className="overflow-hidden rounded-lg border"
        data-pending={isPending || undefined}
      >
        <Table>
          <caption className="sr-only">
            {activityContent.table.caption}
          </caption>

          <TableHeader>
            {table.getHeaderGroups().map(
              (headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef
                              .header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ),
            )}
          </TableHeader>

          <TableBody
            className={
              isPending
                ? "pointer-events-none opacity-50"
                : undefined
            }
          >
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row
                    .getVisibleCells()
                    .map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-40 text-center"
                  colSpan={columns.length}
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {
                        activityContent.table
                          .emptyTitle
                      }
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {
                        activityContent.table
                          .emptyDescription
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ActivityTablePagination
        onPageChange={(page) =>
          updateUrl({
            page: page > 1 ? String(page) : null,
          })
        }
        page={data.page}
        pageCount={data.pageCount}
        total={data.total}
      />
    </section>
  );
}