import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { interviewsContent } from "@/content/interviews";
import { InterviewForm } from "@/features/interviews/components/interview-form";
import { getInterviewFormOptions } from "@/features/interviews/server/get-interview-form-options";

export const dynamic = "force-dynamic";

export default async function NewInterviewPage() {
  const candidates = await getInterviewFormOptions();
  const content = interviewsContent.form;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        description={content.description}
        title={content.title}
      />

      <Card>
        <CardContent className="pt-6">
          <InterviewForm candidates={candidates} />
        </CardContent>
      </Card>
    </div>
  );
}