import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { pageContent } from "@/content/pages";

const content = pageContent.activity;

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
};

export default function ActivityPage() {
  return (
    <PageHeader
      title={content.title}
      description={content.description}
    />
  );
}