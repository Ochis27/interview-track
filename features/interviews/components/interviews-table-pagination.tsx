"use client";

import { Button } from "@/components/ui/button";
import { interviewsContent } from "@/content/interviews";

type InterviewsTablePaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function InterviewsTablePagination({
  page,
  pageCount,
  total,
  onPageChange,
}: InterviewsTablePaginationProps) {
  const content = interviewsContent.pagination;
  const safePageCount = Math.max(pageCount, 1);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        {total} {content.results}
      </p>

      <div className="flex items-center gap-3">
        <Button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
          variant="outline"
        >
          {content.previous}
        </Button>

        <p className="text-sm text-muted-foreground">
          {content.page}{" "}
          <span className="font-medium text-foreground">
            {page}
          </span>{" "}
          {content.of}{" "}
          <span className="font-medium text-foreground">
            {safePageCount}
          </span>
        </p>

        <Button
          disabled={
            pageCount === 0 || page >= pageCount
          }
          onClick={() => onPageChange(page + 1)}
          type="button"
          variant="outline"
        >
          {content.next}
        </Button>
      </div>
    </div>
  );
}