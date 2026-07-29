import {
  BriefcaseBusiness,
  FileText,
  Layers3,
  Mail,
  MessageSquareText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { interviewsContent } from "@/content/interviews";
import type { InterviewDetails } from "@/features/interviews/types/interview-details";

type InterviewDetailsContextProps = {
  interview: InterviewDetails;
};

export function InterviewDetailsContext({
  interview,
}: InterviewDetailsContextProps) {
  const content = interviewsContent.details;
  const { candidate } = interview;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{content.candidateTitle}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">
              {candidate.firstName} {candidate.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {candidate.email}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <Mail
                aria-hidden="true"
                className="mt-0.5 size-4 text-muted-foreground"
              />
              <div>
                <p className="text-sm text-muted-foreground">
                  {content.labels.email}
                </p>
                <p className="text-sm font-medium">
                  {candidate.email}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Layers3
                aria-hidden="true"
                className="mt-0.5 size-4 text-muted-foreground"
              />
              <div>
                <p className="text-sm text-muted-foreground">
                  {content.labels.seniority}
                </p>
                <p className="text-sm font-medium">
                  {candidate.seniority}
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <BriefcaseBusiness
                aria-hidden="true"
                className="mt-0.5 size-4 text-muted-foreground"
              />
              <div>
                <p className="text-sm text-muted-foreground">
                  {content.labels.targetRole}
                </p>
                <p className="text-sm font-medium">
                  {candidate.targetRole ??
                    content.notSpecified}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText
                aria-hidden="true"
                className="size-4"
              />
              {content.notesTitle}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {interview.notes ?? content.noNotes}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText
                aria-hidden="true"
                className="size-4"
              />
              {content.feedbackTitle}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-start gap-3">
            <Badge
              variant={
                interview.hasFeedback
                  ? "secondary"
                  : "outline"
              }
            >
              {interview.hasFeedback
                ? interviewsContent.table.feedbackAvailable
                : interviewsContent.table.feedbackMissing}
            </Badge>

            <p className="text-sm text-muted-foreground">
              {interview.hasFeedback
                ? content.feedbackAvailable
                : content.feedbackPending}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}