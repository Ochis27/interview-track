import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { reportsContent } from "@/content/reports";
import type { ReportsAverageScores } from "@/features/reports/types/reports";

type ScoreOverviewProps = {
  scores: ReportsAverageScores;
};

type ScoreItemProps = {
  label: string;
  value: number | null;
};

function ScoreItem({
  label,
  value,
}: ScoreItemProps) {
  const content = reportsContent.scores;

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <dt className="text-sm text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-2">
        {value === null ? (
          <span className="font-medium text-muted-foreground">
            {content.unavailable}
          </span>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight">
              {value}
            </span>

            <span className="text-sm text-muted-foreground">
              {content.suffix}
            </span>
          </div>
        )}
      </dd>
    </div>
  );
}

export function ScoreOverview({
  scores,
}: ScoreOverviewProps) {
  const content = reportsContent.scores;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>
          {content.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-3">
          <ScoreItem
            label={content.overall}
            value={scores.overall}
          />

          <ScoreItem
            label={content.technical}
            value={scores.technical}
          />

          <ScoreItem
            label={content.communication}
            value={scores.communication}
          />
        </dl>
      </CardContent>
    </Card>
  );
}