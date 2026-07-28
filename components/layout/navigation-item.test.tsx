import { render, screen } from "@testing-library/react";
import { LayoutDashboard, Users } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NavigationItemLink } from "@/components/layout/navigation-item";
import type { NavigationItem } from "@/types/navigation";

const navigationState = vi.hoisted(() => ({
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

const dashboardItem: NavigationItem = {
  label: "Dashboard",
  description: "Application overview",
  href: "/",
  icon: LayoutDashboard,
  exact: true,
};

const candidatesItem: NavigationItem = {
  label: "Candidates",
  description: "Candidate management",
  href: "/candidates",
  icon: Users,
};

describe("NavigationItemLink", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
  });

  it("marks the exact dashboard route as active", () => {
    render(<NavigationItemLink item={dashboardItem} />);

    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("does not mark dashboard active on another route", () => {
    navigationState.pathname = "/candidates";

    render(<NavigationItemLink item={dashboardItem} />);

    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).not.toHaveAttribute("aria-current");
  });

  it("marks nested candidate routes as active", () => {
    navigationState.pathname = "/candidates/candidate-123";

    render(<NavigationItemLink item={candidatesItem} />);

    expect(
      screen.getByRole("link", { name: /candidates/i }),
    ).toHaveAttribute("aria-current", "page");
  });
});