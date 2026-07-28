import { PageHeader } from "@/components/layout/page-header";
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
      <PageHeader
        description={interviewsContent.page.description}
        title={interviewsContent.page.title}
      />

      <InterviewsTable data={data} params={params} />
    </div>
  );
}