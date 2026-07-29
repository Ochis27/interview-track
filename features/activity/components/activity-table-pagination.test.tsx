import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { activityContent } from "@/content/activity";
import { ActivityTablePagination } from "@/features/activity/components/activity-table-pagination";

function hasExactText(
  expectedText: string,
): (
  content: string,
  element: Element | null,
) => boolean {
  return (_content, element) => {
    const normalizedText = element?.textContent
      ?.replace(/\s+/g, " ")
      .trim();

    return (
      element?.tagName.toLowerCase() === "p" &&
      normalizedText === expectedText
    );
  };
}

describe("ActivityTablePagination", () => {
  it("navigates between available pages", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <ActivityTablePagination
        onPageChange={onPageChange}
        page={2}
        pageCount={3}
        total={25}
      />,
    );

    expect(
      screen.getByText(
        `25 ${activityContent.pagination.results}`,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        hasExactText("Page 2 of 3"),
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: activityContent.pagination.previous,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: activityContent.pagination.next,
      }),
    );

    expect(onPageChange).toHaveBeenNthCalledWith(
      1,
      1,
    );

    expect(onPageChange).toHaveBeenNthCalledWith(
      2,
      3,
    );
  });

  it("disables pagination at the boundaries", () => {
    const { rerender } = render(
      <ActivityTablePagination
        onPageChange={vi.fn()}
        page={1}
        pageCount={1}
        total={1}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: activityContent.pagination.previous,
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: activityContent.pagination.next,
      }),
    ).toBeDisabled();

    rerender(
      <ActivityTablePagination
        onPageChange={vi.fn()}
        page={1}
        pageCount={0}
        total={0}
      />,
    );

    expect(
      screen.getByText(
        hasExactText("Page 1 of 1"),
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `0 ${activityContent.pagination.results}`,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: activityContent.pagination.previous,
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: activityContent.pagination.next,
      }),
    ).toBeDisabled();
  });
});