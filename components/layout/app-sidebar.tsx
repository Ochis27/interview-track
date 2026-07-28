"use client";

import { NavigationItemLink } from "@/components/layout/navigation-item";
import { Separator } from "@/components/ui/separator";
import { applicationContent } from "@/content/application";
import {
  navigationContent,
  navigationItems,
} from "@/content/navigation";

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <div
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground"
        >
          {applicationContent.shortName}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {applicationContent.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {applicationContent.workspaceLabel}
          </p>
        </div>
      </div>

      <Separator />

      <nav
        aria-label={navigationContent.primaryLabel}
        className="flex flex-1 flex-col gap-1 p-3"
      >
        {navigationItems.map((item) => (
          <NavigationItemLink
            key={item.href}
            item={item}
          />
        ))}
      </nav>

      <Separator />

      <div className="px-5 py-4">
        <p className="text-xs leading-5 text-muted-foreground">
          {applicationContent.description}
        </p>
      </div>
    </aside>
  );
}