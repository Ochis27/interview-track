import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ReportSummaryCardProps = {
  description: string;
  icon: LucideIcon;
  label: string;
  value: number | string;
};

export function ReportSummaryCard({
  description,
  icon: Icon,
  label,
  value,
}: ReportSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>

        <div className="rounded-md bg-muted p-2">
          <Icon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">
          {value}
        </p>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}