import type { LucideIcon } from "lucide-react";

export type NavigationHref = "/" | `/${string}`;

export type NavigationItem = {
  label: string;
  description: string;
  href: NavigationHref;
  icon: LucideIcon;
  exact?: boolean;
};