import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InterviewsTablePagination } from "@/features/interviews/components/interviews-table-pagination";

describe("InterviewsTablePagination", () => {
  it("navigates between available pages", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    const { rerender } = render(
      <InterviewsTablePagination
        onPageChange={onPageChange}
        page={1}
        pageCount={3}
        total={21}
      />,
    );

    expect(screen.getByText("21 results")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Next" }),
    ).toBeEnabled();

    await user.click(
      screen.getByRole("button", { name: "Next" }),
    );

    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      <InterviewsTablePagination
        onPageChange={onPageChange}
        page={3}
        pageCount={3}
        total={21}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", { name: "Next" }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Previous" }),
    );

    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it("handles an empty result set", () => {
    render(
      <InterviewsTablePagination
        onPageChange={vi.fn()}
        page={1}
        pageCount={0}
        total={0}
      />,
    );

    expect(screen.getByText("0 results")).toBeInTheDocument();

    expect(
      screen.getAllByText("1", { selector: "span" }),
    ).toHaveLength(2);

    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Next" }),
    ).toBeDisabled();
  });
});