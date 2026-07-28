import { PageHeader } from "@/components/layout/page-header";
import { candidatesContent } from "@/content/candidates";
import { CandidatesTable } from "@/features/candidates/components/candidates-table";
import {
  parseCandidateListParams,
  type CandidateSearchParams,
} from "@/features/candidates/schemas/candidate-list-params";
import { getCandidates } from "@/features/candidates/server/get-candidates";

export const dynamic = "force-dynamic";

type CandidatesPageProps = {
  searchParams: Promise<CandidateSearchParams>;
};

export default async function CandidatesPage({
  searchParams,
}: CandidatesPageProps) {
  const params = parseCandidateListParams(await searchParams);
  const data = await getCandidates(params);

  return (
    <div className="space-y-6">
      <PageHeader
        description={candidatesContent.page.description}
        title={candidatesContent.page.title}
      />

      <CandidatesTable data={data} params={params} />
    </div>
  );
}