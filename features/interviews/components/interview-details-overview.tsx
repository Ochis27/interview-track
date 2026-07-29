import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  interviewsContent,
  interviewStatusLabels,
  interviewTypeLabels,
} from "@/content/interviews";
import type { InterviewDetails } from "@/features/interviews/types/interview-details";

type InterviewDetailsOverviewProps = {
  interview: InterviewDetails;
};

type DetailItemProps = {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
};

function DetailItem({
  icon: Icon,
  label,
  children,
}: DetailItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>
        <div className="text-sm font-medium">
          {children}
        </div>
      </div>
    </div>
  );
}

export function InterviewDetailsOverview({
  interview,
}: InterviewDetailsOverviewProps) {
  const content = interviewsContent.details;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>{content.overviewTitle}</CardTitle>

        <Badge variant="outline">
          {interviewStatusLabels[interview.status]}
        </Badge>
      </CardHeader>

      <CardContent className="grid gap-6 sm:grid-cols-2">
        <DetailItem
          icon={ListChecks}
          label={content.labels.type}
        >
          {interviewTypeLabels[interview.type]}
        </DetailItem>

        <DetailItem
          icon={CalendarDays}
          label={content.labels.scheduledAt}
        >
          <time dateTime={interview.scheduledAt.toISOString()}>
            {format(
              interview.scheduledAt,
              "MMM d, yyyy, HH:mm",
            )}
          </time>
        </DetailItem>

        <DetailItem
          icon={Clock3}
          label={content.labels.duration}
        >
          {interview.durationMinutes} {content.minutes}
        </DetailItem>

        <DetailItem
          icon={CalendarDays}
          label={content.labels.createdAt}
        >
          <time dateTime={interview.createdAt.toISOString()}>
            {format(
              interview.createdAt,
              "MMM d, yyyy, HH:mm",
            )}
          </time>
        </DetailItem>

        {interview.completedAt ? (
          <DetailItem
            icon={CheckCircle2}
            label={content.labels.completedAt}
          >
            <time
              dateTime={interview.completedAt.toISOString()}
            >
              {format(
                interview.completedAt,
                "MMM d, yyyy, HH:mm",
              )}
            </time>
          </DetailItem>
        ) : null}
      </CardContent>
    </Card>
  );
}