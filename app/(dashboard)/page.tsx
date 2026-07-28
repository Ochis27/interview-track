import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { dashboardContent } from "@/content/dashboard";
import { pageContent } from "@/content/pages";
import {
  SummaryCard,
} from "@/features/dashboard/components/summary-card";
import {
  UpcomingInterviews,
} from "@/features/dashboard/components/upcoming-interviews";
import {
  getDashboardData,
} from "@/features/dashboard/server/get-dashboard-data";

const content = pageContent.dashboard;

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <PageHeader
        title={content.title}
        description={content.description}
      />

      <section
        aria-label={
          dashboardContent.summarySectionLabel
        }
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {dashboardContent.summaryCards.map(
          ({ key, ...card }) => (
            <SummaryCard
              key={key}
              {...card}
              value={data.summary[key]}
            />
          ),
        )}
      </section>

      <UpcomingInterviews
        interviews={data.upcomingInterviews}
      />
    </div>
  );
}