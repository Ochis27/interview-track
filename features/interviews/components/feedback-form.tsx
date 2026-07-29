"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { interviewsContent } from "@/content/interviews";
import { FeedbackFormFields } from "@/features/interviews/components/feedback-form-fields";
import {
  feedbackFormSchema,
  type FeedbackFormInput,
  type FeedbackFormValues,
} from "@/features/interviews/schemas/feedback-form";
import { createFeedback } from "@/features/interviews/server/create-feedback";
import { Recommendation } from "@/generated/prisma/enums";

type FeedbackFormProps = {
  interviewId: string;
};

const defaultValues: FeedbackFormInput = {
  strengths: "",
  improvementAreas: "",
  recommendation: Recommendation.CONTINUE_PRACTICE,
  overallScore: 3,
  technicalScore: null,
  communicationScore: null,
  additionalNotes: "",
};

export function FeedbackForm({
  interviewId,
}: FeedbackFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<
    string | null
  >(null);

  const form = useForm<
    FeedbackFormInput,
    object,
    FeedbackFormValues
  >({
    defaultValues,
    resolver: zodResolver(feedbackFormSchema),
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function handleValidSubmit(
    values: FeedbackFormValues,
  ) {
    setServerError(null);
    form.clearErrors();

    const result = await createFeedback(interviewId, {
      ...values,
      additionalNotes: values.additionalNotes ?? "",
    });

    if (!result.success) {
      setServerError(result.message);

      const fieldErrors = Object.entries(
        result.fieldErrors ?? {},
      ) as Array<
        [keyof FeedbackFormInput, string[]]
      >;

      for (const [field, messages] of fieldErrors) {
        form.setError(field, {
          message: messages[0],
          type: "server",
        });
      }

      return;
    }

    router.refresh();
  }

  const content = interviewsContent.feedbackForm;

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={form.handleSubmit(handleValidSubmit)}
    >
      <FeedbackFormFields form={form} />

      {serverError ? (
        <p
          aria-live="polite"
          className="text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting
            ? content.submitting
            : content.submit}
        </Button>
      </div>
    </form>
  );
}