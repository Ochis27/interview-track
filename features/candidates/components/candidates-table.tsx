"use client";

import type { FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { candidatesContent } from "@/content/candidates";
import {
  createCandidateColumns,
  type CandidateSortField,
} from "@/features/candidates/components/candidate-columns";
import type { CandidateListParams } from "@/features/candidates/schemas/candidate-list-params";
import type { CandidateListData } from "@/features/candidates/types/candidate";

type CandidatesTableProps = {
  data: CandidateListData;
  params: CandidateListParams;
};

type QueryUpdates = Record<string, string | null>;

export function CandidatesTable({
  data,
  params,
}: CandidatesTableProps) {
  "use no memo";

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateUrl(updates: QueryUpdates) {
    const nextParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }

    const queryString = nextParams.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(url, { scroll: false });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const queryInput = event.currentTarget.elements.namedItem(
    "query",
  ) as HTMLInputElement;

  const query = queryInput.value.trim();

  updateUrl({
    query: query || null,
    page: null,
  });
}

  function handleClearSearch() {
    updateUrl({
      query: null,
      page: null,
    });
  }

  function handleSort(field: CandidateSortField) {
    const isCurrentField = params.sortBy === field;
    const sortDirection =
      isCurrentField && params.sortDirection === "asc"
        ? "desc"
        : "asc";

    updateUrl({
      sortBy: field,
      sortDirection,
      page: null,
    });
  }

  function handlePage(page: number) {
    updateUrl({
      page: String(page),
    });
  }

  const columns = createCandidateColumns({
    sortBy: params.sortBy,
    direction: params.sortDirection,
    onSort: handleSort,
  });

  // TanStack Table v8 relies on interior mutability and is currently
  // incompatible with React Compiler memoization.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data.candidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data.pageCount,
  });

  const content = candidatesContent;
  const pageCount = Math.max(data.pageCount, 1);
  const rows = table.getRowModel().rows;

  return (
    <section aria-label={content.table.caption} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="flex w-full max-w-xl gap-2"
          onSubmit={handleSearch}
        >
          <label className="sr-only" htmlFor="candidate-search">
            {content.search.label}
          </label>

          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              className="pl-9"
              defaultValue={params.query}
              id="candidate-search"
              key={params.query}
              name="query"
              placeholder={content.search.placeholder}
            />
          </div>

          <Button type="submit">{content.search.submit}</Button>

          {params.query ? (
            <Button
              aria-label={content.search.clear}
              onClick={handleClearSearch}
              type="button"
              variant="outline"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          ) : null}
        </form>

        <p
          aria-live="polite"
          className="text-sm text-muted-foreground sm:ml-auto"
        >
          {data.total} {content.pagination.resultsLabel}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {rows.length > 0 ? (
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
                      {content.table.emptyTitle}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {content.table.emptyDescription}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {content.pagination.pageLabel} {data.page}{" "}
          {content.pagination.ofLabel} {pageCount}
        </p>

        <div className="flex gap-2">
          <Button
            disabled={data.page <= 1}
            onClick={() => handlePage(data.page - 1)}
            type="button"
            variant="outline"
          >
            {content.pagination.previous}
          </Button>

          <Button
            disabled={
              data.pageCount === 0 || data.page >= data.pageCount
            }
            onClick={() => handlePage(data.page + 1)}
            type="button"
            variant="outline"
          >
            {content.pagination.next}
          </Button>
        </div>
      </div>
    </section>
  );
}