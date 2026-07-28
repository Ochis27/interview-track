import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppHeader } from "@/components/layout/app-header";

vi.mock("@/components/layout/mobile-navigation", () => ({
  MobileNavigation: () => (
    <button type="button">
      Open navigation menu
    </button>
  ),
}));

describe("AppHeader", () => {
  it("renders the application and interviewer information", () => {
    render(<AppHeader />);

    expect(
      screen.getByText("Interview Track"),
    ).toBeVisible();

    expect(
      screen.getByText("Interview workspace"),
    ).toBeVisible();

    expect(
      screen.getByText("Main Interviewer"),
    ).toBeVisible();

    expect(
      screen.getByText("Interviewer"),
    ).toBeVisible();

    expect(
      screen.getByText("MI"),
    ).toBeVisible();

    expect(
      screen.getByRole("button", {
        name: "Open navigation menu",
      }),
    ).toBeVisible();
  });
});