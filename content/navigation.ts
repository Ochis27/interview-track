import {
  Activity,
  CalendarDays,
  ChartNoAxesCombined,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";

import type { NavigationItem } from "@/types/navigation";

export const navigationContent = {
  primaryLabel: "Primary navigation",
  mobileMenuLabel: "Open navigation menu",
} as const;

export const navigationItems = [
  {
    label: "Dashboard",
    description: "Overview of interview activity",
    href: "/",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Candidates",
    description: "Manage candidate profiles",
    href: "/candidates",
    icon: UsersRound,
  },
  {
    label: "Interviews",
    description: "Schedule and review interviews",
    href: "/interviews",
    icon: CalendarDays,
  },
  {
    label: "Reports",
    description: "Analyze interview trends",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Activity Logs",
    description: "Review administrative activity",
    href: "/activity",
    icon: Activity,
  },
] satisfies readonly NavigationItem[];