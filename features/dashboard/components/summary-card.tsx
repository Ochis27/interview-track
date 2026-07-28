import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SummaryCardProps = {
  label: string;
  description: string;
  value: number;
  icon: LucideIcon;
};

export function SummaryCard({
  label,
  description,
  value,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {label}
        </CardTitle>

        <CardAction
          aria-hidden="true"
          className="rounded-lg bg-muted p-2 text-muted-foreground"
        >
          <Icon className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-1">
        <p className="text-3xl font-semibold tracking-tight">
          {value.toLocaleString("en-US")}
        </p>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}