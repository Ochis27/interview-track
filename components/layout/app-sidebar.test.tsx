import {
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { AppSidebar } from "@/components/layout/app-sidebar";

const navigationState = vi.hoisted(() => ({
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

describe("AppSidebar", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
  });

  it("renders application information and navigation items", () => {
    render(<AppSidebar />);

    expect(
      screen.getByText("Interview Track"),
    ).toBeVisible();

    expect(
      screen.getByText("Interview workspace"),
    ).toBeVisible();

    expect(
      screen.getByText(
        "Plan mock interviews, track candidates, and capture structured feedback.",
      ),
    ).toBeVisible();

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });

    expect(
      within(navigation).getAllByRole("link"),
    ).toHaveLength(5);

    expect(
      within(navigation).getByRole("link", {
        name: "Dashboard",
      }),
    ).toBeVisible();

    expect(
      within(navigation).getByRole("link", {
        name: "Candidates",
      }),
    ).toBeVisible();

    expect(
      within(navigation).getByRole("link", {
        name: "Interviews",
      }),
    ).toBeVisible();

    expect(
      within(navigation).getByRole("link", {
        name: "Reports",
      }),
    ).toBeVisible();

    expect(
      within(navigation).getByRole("link", {
        name: "Activity Logs",
      }),
    ).toBeVisible();
  });

  it("marks the current navigation item as active", () => {
    navigationState.pathname = "/candidates";

    render(<AppSidebar />);

    expect(
      screen.getByRole("link", {
        name: "Candidates",
      }),
    ).toHaveAttribute("aria-current", "page");

    expect(
      screen.getByRole("link", {
        name: "Dashboard",
      }),
    ).not.toHaveAttribute("aria-current");
  });
});