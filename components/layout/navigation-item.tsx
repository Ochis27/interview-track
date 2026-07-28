"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/navigation";

type NavigationItemProps = {
  item: NavigationItem;
  onNavigate?: () => void;
};

function isNavigationItemActive(
  pathname: string,
  item: NavigationItem,
) {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

export function NavigationItemLink({
  item,
  onNavigate,
}: NavigationItemProps) {
  const pathname = usePathname();
  const isActive = isNavigationItemActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={item.description}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2",
        "text-sm font-medium text-sidebar-foreground",
        "transition-colors focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span>{item.label}</span>
    </Link>
  );
}