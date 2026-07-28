"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";

import { NavigationItemLink } from "@/components/layout/navigation-item";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { applicationContent } from "@/content/application";
import {
  navigationContent,
  navigationItems,
} from "@/content/navigation";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={navigationContent.mobileMenuLabel}
            className="lg:hidden"
          />
        }
      >
        <MenuIcon aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 gap-0 bg-sidebar p-0"
      >
        <SheetHeader className="border-b border-sidebar-border p-5">
          <SheetTitle className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground"
            >
              {applicationContent.shortName}
            </span>

            <span>{applicationContent.name}</span>
          </SheetTitle>

          <SheetDescription className="sr-only">
            {applicationContent.description}
          </SheetDescription>
        </SheetHeader>

        <nav
          aria-label={navigationContent.primaryLabel}
          className="flex flex-1 flex-col gap-1 p-3"
        >
          {navigationItems.map((item) => (
            <NavigationItemLink
              key={item.href}
              item={item}
              onNavigate={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}