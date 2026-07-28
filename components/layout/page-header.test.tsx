import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "@/components/layout/page-header";

describe("PageHeader", () => {
  it("renders the supplied title and description", () => {
    render(
      <PageHeader
        title="Candidates"
        description="Manage candidate profiles and interview history."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Candidates" }),
    ).toBeVisible();

    expect(
      screen.getByText(
        "Manage candidate profiles and interview history.",
      ),
    ).toBeVisible();
  });

  it("renders an optional action", () => {
    render(
      <PageHeader
        title="Candidates"
        description="Manage candidate profiles."
        actions={
          <button type="button">
            Create candidate
          </button>
        }
      />,
    );

    expect(
      screen.getByRole("button", { name: "Create candidate" }),
    ).toBeVisible();
  });
});