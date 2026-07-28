"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { candidatesContent } from "@/content/candidates";
import { CandidateFormFields } from "@/features/candidates/components/candidate-form-fields";
import {
  candidateFormSchema,
  type CandidateFormInput,
  type CandidateFormValues,
} from "@/features/candidates/schemas/candidate-form";
import { createCandidate } from "@/features/candidates/server/create-candidate";
import { SeniorityLevel } from "@/generated/prisma/enums";

const defaultValues: CandidateFormInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  currentRole: "",
  targetRole: "",
  seniority: SeniorityLevel.JUNIOR,
  yearsExperience: null,
  notes: "",
};

export function CandidateForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(
    null,
  );

  const form = useForm<
    CandidateFormInput,
    object,
    CandidateFormValues
  >({
    defaultValues,
    resolver: zodResolver(candidateFormSchema),
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function handleValidSubmit(values: CandidateFormValues) {
    setServerError(null);
    form.clearErrors();

    const result = await createCandidate(values);

    if (!result.success) {
      setServerError(result.message);

      const fieldErrors = Object.entries(
        result.fieldErrors ?? {},
      ) as Array<[keyof CandidateFormInput, string[]]>;

      for (const [field, messages] of fieldErrors) {
        form.setError(field, {
          message: messages[0],
          type: "server",
        });
      }

      return;
    }

    router.push("/candidates");
    router.refresh();
  }

  const content = candidatesContent.form;

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={form.handleSubmit(handleValidSubmit)}
    >
      <CandidateFormFields form={form} />

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
          className={buttonVariants({ variant: "outline" })}
          href="/candidates"
        >
          {content.cancel}
        </Link>

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting
            ? content.submitting
            : content.submit}
        </Button>
      </div>
    </form>
  );
}