import { PageHeader } from "@/components/layout/page-header";
import { candidatesContent } from "@/content/candidates";
import { CandidatesTable } from "@/features/candidates/components/candidates-table";
import {
  parseCandidateListParams,
  type CandidateSearchParams,
} from "@/features/candidates/schemas/candidate-list-params";
import { getCandidates } from "@/features/candidates/server/get-candidates";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <PageHeader
        description={candidatesContent.page.description}
        title={candidatesContent.page.title}
      />

      <Link
        className={buttonVariants()}
        href="/candidates/new"
      >
        <Plus aria-hidden="true" className="size-4" />
        {candidatesContent.form.addButton}
      </Link>
    </div>

    <CandidatesTable data={data} params={params} />
  </div>
);
}