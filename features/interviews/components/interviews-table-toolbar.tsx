"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  interviewsContent,
  interviewStatusLabels,
} from "@/content/interviews";
import { InterviewStatus } from "@/generated/prisma/enums";

export type InterviewStatusFilter =
  | "ALL"
  | InterviewStatus;

type InterviewsTableToolbarProps = {
  query: string;
  status: InterviewStatusFilter;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: InterviewStatusFilter) => void;
};

export function InterviewsTableToolbar({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: InterviewsTableToolbarProps) {
  const content = interviewsContent.filters;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          aria-label={content.searchLabel}
          className="pr-10 pl-9"
          onChange={(event) =>
            onQueryChange(event.target.value)
          }
          placeholder={content.searchPlaceholder}
          type="search"
          value={query}
        />

        {query ? (
          <Button
            aria-label={content.clearSearch}
            className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
            onClick={() => onQueryChange("")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        ) : null}
      </div>

      <Select
        onValueChange={(value) => {
          if (value) {
            onStatusChange(
              value as InterviewStatusFilter,
            );
          }
        }}
        value={status}
      >
        <SelectTrigger
          aria-label={content.statusLabel}
          className="w-full sm:w-48"
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">
            {content.allStatuses}
          </SelectItem>

          {Object.values(InterviewStatus).map(
            (interviewStatus) => (
              <SelectItem
                key={interviewStatus}
                value={interviewStatus}
              >
                {interviewStatusLabels[interviewStatus]}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}