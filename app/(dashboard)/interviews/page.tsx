import Link from "next/link";
import { CalendarPlus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { interviewsContent } from "@/content/interviews";
import { InterviewsTable } from "@/features/interviews/components/interviews-table";
import {
  parseInterviewListParams,
  type InterviewSearchParams,
} from "@/features/interviews/schemas/interview-list-params";
import { getInterviews } from "@/features/interviews/server/get-interviews";

export const dynamic = "force-dynamic";

type InterviewsPageProps = {
  searchParams: Promise<InterviewSearchParams>;
};

export default async function InterviewsPage({
  searchParams,
}: InterviewsPageProps) {
  const params = parseInterviewListParams(
    await searchParams,
  );
  const data = await getInterviews(params);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description={interviewsContent.page.description}
          title={interviewsContent.page.title}
        />

        <Link
          className={buttonVariants()}
          href="/interviews/new"
        >
          <CalendarPlus
            aria-hidden="true"
            className="size-4"
          />
          {interviewsContent.actions.create}
        </Link>
      </div>

      <InterviewsTable data={data} params={params} />
    </div>
  );
}