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
import { interviewsContent } from "@/content/interviews";
import {
  createInterviewColumns,
  type InterviewSortField,
} from "@/features/interviews/components/interview-columns";
import { InterviewsTablePagination } from "@/features/interviews/components/interviews-table-pagination";
import {
  InterviewsTableToolbar,
  type InterviewStatusFilter,
} from "@/features/interviews/components/interviews-table-toolbar";
import type { InterviewListData } from "@/features/interviews/types/interview";

type InterviewsTableProps = {
  data: InterviewListData;
  params: {
    query: string;
    status: InterviewStatusFilter;
    sortBy: InterviewSortField;
    sortDirection: "asc" | "desc";
  };
};

type UrlUpdates = Record<string, string | null>;

export function InterviewsTable({
  data,
  params,
}: InterviewsTableProps) {
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

    startTransition(() => router.replace(href));
  }

  function handleSort(field: InterviewSortField) {
    const direction =
      params.sortBy === field &&
      params.sortDirection === "asc"
        ? "desc"
        : "asc";

    updateUrl({
      sortBy: field,
      sortDirection: direction,
      page: null,
    });
  }

  const columns = createInterviewColumns({
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    onSort: handleSort,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data.interviews,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: data.pageCount,
  });

  const rows = table.getRowModel().rows;

  return (
    <section aria-busy={isPending} className="space-y-4">
      <InterviewsTableToolbar
        onQueryChange={(query: string) =>
          updateUrl({
            query: query || null,
            page: null,
          })
        }
        onStatusChange={(
          status: InterviewStatusFilter,
        ) =>
          updateUrl({
            status: status === "ALL" ? null : status,
            page: null,
          })
        }
        query={params.query}
        status={params.status}
      />

      <div
        className="overflow-hidden rounded-lg border"
        data-pending={isPending || undefined}
      >
        <Table>
          <caption className="sr-only">
            {interviewsContent.table.caption}
          </caption>

          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody
            className={
              isPending
                ? "pointer-events-none opacity-50"
                : undefined
            }
          >
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
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
                  <p className="font-medium">
                    {interviewsContent.table.emptyTitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {
                      interviewsContent.table
                        .emptyDescription
                    }
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <InterviewsTablePagination
        onPageChange={(page: number) =>
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