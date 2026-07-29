"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { interviewsContent } from "@/content/interviews";
import { InterviewFormFields } from "@/features/interviews/components/interview-form-fields";
import {
  interviewFormSchema,
  type InterviewFormInput,
  type InterviewFormValues,
} from "@/features/interviews/schemas/interview-form";
import { createInterview } from "@/features/interviews/server/create-interview";
import type { InterviewCandidateOption } from "@/features/interviews/types/interview-form";
import { InterviewType } from "@/generated/prisma/enums";

type InterviewFormProps = {
  candidates: InterviewCandidateOption[];
};

const defaultValues: InterviewFormInput = {
  candidateId: "",
  title: "",
  type: InterviewType.TECHNICAL,
  scheduledAt: "",
  durationMinutes: 60,
  notes: "",
};

export function InterviewForm({
  candidates,
}: InterviewFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<
    string | null
  >(null);

  const form = useForm<
    InterviewFormInput,
    object,
    InterviewFormValues
  >({
    defaultValues,
    resolver: zodResolver(interviewFormSchema),
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function handleValidSubmit(
    values: InterviewFormValues,
  ) {
    setServerError(null);
    form.clearErrors();

    const result = await createInterview({
      ...values,
      scheduledAt: values.scheduledAt.toISOString(),
    });

    if (!result.success) {
      setServerError(result.message);

      const fieldErrors = Object.entries(
        result.fieldErrors ?? {},
      ) as Array<
        [keyof InterviewFormInput, string[]]
      >;

      for (const [field, messages] of fieldErrors) {
        form.setError(field, {
          message: messages[0],
          type: "server",
        });
      }

      return;
    }

    router.push("/interviews");
    router.refresh();
  }

  const content = interviewsContent.form;
  const hasCandidates = candidates.length > 0;

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={form.handleSubmit(handleValidSubmit)}
    >
      <InterviewFormFields
        candidates={candidates}
        form={form}
      />

      {!hasCandidates ? (
        <p
          aria-live="polite"
          className="text-sm text-amber-700"
          role="status"
        >
          {content.noCandidates}
        </p>
      ) : null}

      {serverError ? (
        <p
          aria-live="polite"
          className="text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        <Link
          className={buttonVariants({
            variant: "outline",
          })}
          href="/interviews"
        >
          {content.cancel}
        </Link>

        <Button
          disabled={isSubmitting || !hasCandidates}
          type="submit"
        >
          {isSubmitting
            ? content.submitting
            : content.submit}
        </Button>
      </div>
    </form>
  );
}