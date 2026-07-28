import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { candidatesContent } from "@/content/candidates";
import { CandidateForm } from "@/features/candidates/components/candidate-form";

export default function NewCandidatePage() {
  const content = candidatesContent.form;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        description={content.description}
        title={content.title}
      />

      <Card>
        <CardContent className="p-6">
          <CandidateForm />
        </CardContent>
      </Card>
    </div>
  );
}