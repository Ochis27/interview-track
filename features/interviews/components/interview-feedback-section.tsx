import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  interviewsContent,
  recommendationLabels,
} from "@/content/interviews";
import { FeedbackForm } from "@/features/interviews/components/feedback-form";
import type { InterviewFeedbackDetails } from "@/features/interviews/types/interview-details";
import { InterviewStatus } from "@/generated/prisma/enums";

type InterviewFeedbackSectionProps = {
  feedback: InterviewFeedbackDetails | null;
  interviewId: string;
  status: InterviewStatus;
};

type FeedbackScoreProps = {
  label: string;
  value: number | null;
};

function FeedbackScore({
  label,
  value,
}: FeedbackScoreProps) {
  const content = interviewsContent.feedbackForm.display;

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <dt className="text-sm text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-1 font-semibold text-foreground">
        {value === null ? (
          content.notScored
        ) : (
          <>
            {value}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {content.scoreSuffix}
            </span>
          </>
        )}
      </dd>
    </div>
  );
}

function SubmittedFeedback({
  feedback,
}: {
  feedback: InterviewFeedbackDetails;
}) {
  const content = interviewsContent.feedbackForm;
  const display = content.display;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{display.submittedTitle}</CardTitle>

            <CardDescription>
              {display.submittedDescription}
            </CardDescription>
          </div>

          <Badge variant="secondary">
            {
              recommendationLabels[
                feedback.recommendation
              ]
            }
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {display.submittedAt}{" "}
          <time dateTime={feedback.createdAt.toISOString()}>
            {format(
              feedback.createdAt,
              "MMM d, yyyy, HH:mm",
            )}
          </time>
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <section className="space-y-2">
          <h3 className="font-medium">
            {content.fields.strengths}
          </h3>

          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {feedback.strengths}
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-medium">
            {content.fields.improvementAreas}
          </h3>

          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {feedback.improvementAreas}
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-medium">
            {display.scoreSummary}
          </h3>

          <dl className="grid gap-3 sm:grid-cols-3">
            <FeedbackScore
              label={content.fields.overallScore}
              value={feedback.overallScore}
            />

            <FeedbackScore
              label={content.fields.technicalScore}
              value={feedback.technicalScore}
            />

            <FeedbackScore
              label={content.fields.communicationScore}
              value={feedback.communicationScore}
            />
          </dl>
        </section>

        {feedback.additionalNotes ? (
          <section className="space-y-2">
            <h3 className="font-medium">
              {content.fields.additionalNotes}
            </h3>

            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {feedback.additionalNotes}
            </p>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function InterviewFeedbackSection({
  feedback,
  interviewId,
  status,
}: InterviewFeedbackSectionProps) {
  const content = interviewsContent.feedbackForm;

  if (feedback) {
    return <SubmittedFeedback feedback={feedback} />;
  }

  if (status !== InterviewStatus.COMPLETED) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>
          {content.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FeedbackForm interviewId={interviewId} />
      </CardContent>
    </Card>
  );
}