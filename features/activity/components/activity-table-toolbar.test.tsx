import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  activityContent,
  auditLevelLabels,
} from "@/content/activity";
import { ActivityTableToolbar } from "@/features/activity/components/activity-table-toolbar";
import { AuditLevel } from "@/generated/prisma/enums";

const INTERACTION_TEST_TIMEOUT = 15_000;

describe("ActivityTableToolbar", () => {
  it(
    "changes and clears the search query",
    async () => {
      const user = userEvent.setup();
      const onQueryChange = vi.fn();

      const { rerender } = render(
        <ActivityTableToolbar
          level="ALL"
          onLevelChange={vi.fn()}
          onQueryChange={onQueryChange}
          query=""
        />,
      );

      const searchInput = screen.getByRole(
        "searchbox",
        {
          name: activityContent.filters.searchLabel,
        },
      );

      fireEvent.change(searchInput, {
        target: {
          value: "feedback",
        },
      });

      expect(searchInput).toHaveValue("feedback");

      await waitFor(
        () => {
          expect(
            onQueryChange,
          ).toHaveBeenCalledWith("feedback");
        },
        {
          timeout: 5_000,
        },
      );

      rerender(
        <ActivityTableToolbar
          level="ALL"
          onLevelChange={vi.fn()}
          onQueryChange={onQueryChange}
          query="feedback"
        />,
      );

      await user.click(
        screen.getByRole("button", {
          name: activityContent.filters.clearSearch,
        }),
      );

      expect(searchInput).toHaveValue("");

      await waitFor(
        () => {
          expect(
            onQueryChange,
          ).toHaveBeenLastCalledWith("");
        },
        {
          timeout: 5_000,
        },
      );
    },
    INTERACTION_TEST_TIMEOUT,
  );

  it(
    "changes the selected activity level",
    async () => {
      const user = userEvent.setup();
      const onLevelChange = vi.fn();

      render(
        <ActivityTableToolbar
          level="ALL"
          onLevelChange={onLevelChange}
          onQueryChange={vi.fn()}
          query=""
        />,
      );

      const levelSelect = screen.getByRole(
        "combobox",
        {
          name: activityContent.filters.levelLabel,
        },
      );

      await user.click(levelSelect);

      await waitFor(
        () => {
          expect(levelSelect).toHaveAttribute(
            "aria-expanded",
            "true",
          );
        },
        {
          timeout: 5_000,
        },
      );

      const warningOption =
        await screen.findByRole(
          "option",
          {
            name: auditLevelLabels[
              AuditLevel.WARNING
            ],
          },
          {
            timeout: 5_000,
          },
        );

      await user.click(warningOption);

      await waitFor(() => {
        expect(onLevelChange).toHaveBeenCalledTimes(1);
        expect(onLevelChange).toHaveBeenCalledWith(
          AuditLevel.WARNING,
        );
      });
    },
    INTERACTION_TEST_TIMEOUT,
  );
});