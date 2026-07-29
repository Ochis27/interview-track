import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { interviewsContent } from "@/content/interviews";
import { CompleteInterviewButton } from "@/features/interviews/components/complete-interview-button";
import { InterviewDetailsContext } from "@/features/interviews/components/interview-details-context";
import { InterviewDetailsOverview } from "@/features/interviews/components/interview-details-overview";
import { InterviewFeedbackSection } from "@/features/interviews/components/interview-feedback-section";
import { getInterviewDetails } from "@/features/interviews/server/get-interview-details";

export const dynamic = "force-dynamic";

type InterviewDetailsPageProps = {
  params: Promise<{
    interviewId: string;
  }>;
};

export default async function InterviewDetailsPage({
  params,
}: InterviewDetailsPageProps) {
  const { interviewId } = await params;
  const interview = await getInterviewDetails(interviewId);

  if (!interview) {
    notFound();
  }

  const content = interviewsContent.details;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        className={buttonVariants({
          size: "sm",
          variant: "ghost",
        })}
        href="/interviews"
      >
        <ArrowLeft
          aria-hidden="true"
          className="size-4"
        />

        {content.back}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description={content.description}
          title={interview.title}
        />

        <CompleteInterviewButton
          interviewId={interview.id}
          status={interview.status}
        />
      </div>

      <InterviewDetailsOverview interview={interview} />

      <InterviewDetailsContext interview={interview} />

      <InterviewFeedbackSection
        feedback={interview.feedback}
        interviewId={interview.id}
        status={interview.status}
      />
    </div>
  );
}