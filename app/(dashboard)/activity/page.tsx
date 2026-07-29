import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { activityContent } from "@/content/activity";
import { ActivityTable } from "@/features/activity/components/activity-table";
import { parseActivityListParams } from "@/features/activity/schemas/activity-list-params";
import { getActivityLogs } from "@/features/activity/server/get-activity-logs";
import type { ActivitySearchParams } from "@/features/activity/types/activity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: activityContent.page.title,
  description: activityContent.page.description,
};

type ActivityPageProps = {
  searchParams: Promise<ActivitySearchParams>;
};

export default async function ActivityPage({
  searchParams,
}: ActivityPageProps) {
  const params = parseActivityListParams(
    await searchParams,
  );

  const data = await getActivityLogs(params);

  return (
    <div className="space-y-6">
      <PageHeader
        description={activityContent.page.description}
        title={activityContent.page.title}
      />

      <ActivityTable
        data={data}
        params={params}
      />
    </div>
  );
}