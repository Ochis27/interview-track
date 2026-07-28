import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { pageContent } from "@/content/pages";

const content = pageContent.interviews;

export const metadata: Metadata = {
  title: content.title,
  description: content.description,
};

export default function InterviewsPage() {
  return (
    <PageHeader
      title={content.title}
      description={content.description}
    />
  );
}