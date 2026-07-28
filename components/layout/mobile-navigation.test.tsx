import type {
  AnchorHTMLAttributes,
} from "react";

import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { MobileNavigation } from "@/components/layout/mobile-navigation";

const navigationState = vi.hoisted(() => ({
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

type MockLinkProps =
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: MockLinkProps) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

describe("MobileNavigation", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
  });

  it("renders the accessible mobile menu trigger", () => {
    render(<MobileNavigation />);

    expect(
      screen.getByRole("button", {
        name: "Open navigation menu",
      }),
    ).toBeVisible();

    expect(
      screen.queryByRole("navigation", {
        name: "Primary navigation",
      }),
    ).not.toBeInTheDocument();
  });

  it("opens the menu and closes it after navigation", async () => {
    const user = userEvent.setup();

    render(<MobileNavigation />);

    const trigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    await user.click(trigger);

    const navigation = await screen.findByRole(
      "navigation",
      {
        name: "Primary navigation",
      },
    );

    expect(
      within(navigation).getAllByRole("link"),
    ).toHaveLength(5);

    expect(
      screen.getByText("Interview Track"),
    ).toBeVisible();

    expect(trigger).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(
      within(navigation).getByRole("link", {
        name: "Candidates",
      }),
    );

    await waitFor(() => {
      expect(trigger).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });
});