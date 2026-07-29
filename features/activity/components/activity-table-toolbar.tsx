"use client";

import { useEffect, useState } from "react";
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
  activityContent,
  auditLevelLabels,
} from "@/content/activity";
import type { ActivityLevelFilter } from "@/features/activity/types/activity";
import { AuditLevel } from "@/generated/prisma/enums";

export type ActivityTableToolbarProps = {
  level: ActivityLevelFilter;
  query: string;
  onLevelChange: (
    level: ActivityLevelFilter,
  ) => void;
  onQueryChange: (query: string) => void;
};

const SEARCH_DELAY = 300;

export function ActivityTableToolbar({
  level,
  query,
  onLevelChange,
  onQueryChange,
}: ActivityTableToolbarProps) {
  const [searchValue, setSearchValue] = useState(query);
  const content = activityContent.filters;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchValue !== query) {
        onQueryChange(searchValue.trim());
      }
    }, SEARCH_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [onQueryChange, query, searchValue]);

  function clearSearch() {
    setSearchValue("");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          aria-label={content.searchLabel}
          className="pl-9 pr-10"
          onChange={(event) =>
            setSearchValue(event.target.value)
          }
          placeholder={content.searchPlaceholder}
          type="search"
          value={searchValue}
        />

        {searchValue ? (
          <Button
            aria-label={content.clearSearch}
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
            onClick={clearSearch}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X
              aria-hidden="true"
              className="size-4"
            />
          </Button>
        ) : null}
      </div>

      <Select
        onValueChange={(value) => {
          if (value) {
            onLevelChange(
              value as ActivityLevelFilter,
            );
          }
        }}
        value={level}
      >
        <SelectTrigger
          aria-label={content.levelLabel}
          className="w-full sm:w-48"
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">
            {content.allLevels}
          </SelectItem>

          {Object.values(AuditLevel).map(
            (auditLevel) => (
              <SelectItem
                key={auditLevel}
                value={auditLevel}
              >
                {auditLevelLabels[auditLevel]}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}