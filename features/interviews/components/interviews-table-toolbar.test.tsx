import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InterviewsTableToolbar } from "@/features/interviews/components/interviews-table-toolbar";
import { InterviewStatus } from "@/generated/prisma/enums";

describe("InterviewsTableToolbar", () => {
  it("changes and clears the search query", async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();

    const { rerender } = render(
      <InterviewsTableToolbar
        onQueryChange={onQueryChange}
        onStatusChange={vi.fn()}
        query=""
        status="ALL"
      />,
    );

    const search = screen.getByRole("searchbox", {
      name: "Search interviews",
    });

    fireEvent.change(search, {
      target: { value: "Ada" },
    });

    expect(onQueryChange).toHaveBeenCalledWith("Ada");
    expect(
      screen.queryByRole("button", {
        name: "Clear search",
      }),
    ).not.toBeInTheDocument();

    rerender(
      <InterviewsTableToolbar
        onQueryChange={onQueryChange}
        onStatusChange={vi.fn()}
        query="Ada"
        status="ALL"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Clear search",
      }),
    );

    expect(onQueryChange).toHaveBeenLastCalledWith("");
  });

  it("changes the selected interview status", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <InterviewsTableToolbar
        onQueryChange={vi.fn()}
        onStatusChange={onStatusChange}
        query=""
        status="ALL"
      />,
    );

    await user.click(
      screen.getByRole("combobox", {
        name: "Filter by status",
      }),
    );

    await user.click(
      await screen.findByRole("option", {
        name: "Completed",
      }),
    );

    expect(onStatusChange).toHaveBeenCalledWith(
      InterviewStatus.COMPLETED,
    );
  });
});