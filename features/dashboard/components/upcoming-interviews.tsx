import { format } from "date-fns";
import { CalendarDays, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardContent } from "@/content/dashboard";
import type {
  UpcomingInterview,
} from "@/features/dashboard/types/dashboard";

type UpcomingInterviewsProps = {
  interviews: UpcomingInterview[];
};

export function UpcomingInterviews({
  interviews,
}: UpcomingInterviewsProps) {
  const { upcoming } = dashboardContent;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 id="upcoming-interviews-title">
            {upcoming.title}
          </h2>
        </CardTitle>

        <CardDescription>
          {upcoming.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {interviews.length === 0 ? (
          <div
            role="status"
            className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center"
          >
            <CalendarDays
              aria-hidden="true"
              className="mb-3 size-8 text-muted-foreground"
            />

            <p className="font-medium">
              {upcoming.emptyTitle}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {upcoming.emptyDescription}
            </p>
          </div>
        ) : (
          <ul
            aria-labelledby="upcoming-interviews-title"
            className="divide-y"
          >
            {interviews.map((interview) => (
              <li
                key={interview.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {interview.title}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {interview.candidate.firstName}{" "}
                    {interview.candidate.lastName}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {
                        dashboardContent
                          .interviewTypeLabels[
                          interview.type
                        ]
                      }
                    </Badge>

                    <Badge variant="outline">
                      {
                        dashboardContent
                          .seniorityLabels[
                          interview.candidate.seniority
                        ]
                      }
                    </Badge>
                  </div>
                </div>

                <div className="text-sm sm:text-right">
                  <time
                    dateTime={interview.scheduledAt.toISOString()}
                    className="font-medium"
                  >
                    {format(
                      interview.scheduledAt,
                      upcoming.dateFormat,
                    )}
                  </time>

                  <p className="mt-1 flex items-center gap-1 text-muted-foreground sm:justify-end">
                    <Clock3
                      aria-hidden="true"
                      className="size-3.5"
                    />
                    {interview.durationMinutes}{" "}
                    {upcoming.durationSuffix}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}