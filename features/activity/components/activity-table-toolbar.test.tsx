import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { activityContent } from "@/content/activity";
import { ActivityTableToolbar } from "@/features/activity/components/activity-table-toolbar";
import { AuditLevel } from "@/generated/prisma/enums";

describe("ActivityTableToolbar", () => {
  it("changes and clears the search query", async () => {
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

    await user.type(searchInput, "feedback");

    await waitFor(() => {
      expect(onQueryChange).toHaveBeenCalledWith(
        "feedback",
      );
    });

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

    await waitFor(() => {
      expect(onQueryChange).toHaveBeenCalledWith("");
    });
  });

  it("changes the selected activity level", async () => {
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

    await user.click(
      screen.getByRole("combobox", {
        name: activityContent.filters.levelLabel,
      }),
    );

    await user.click(
      screen.getByRole("option", {
        name: "Warning",
      }),
    );

    expect(onLevelChange).toHaveBeenCalledWith(
      AuditLevel.WARNING,
    );
  });
});