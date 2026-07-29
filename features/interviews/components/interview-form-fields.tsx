"use client";

import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  interviewsContent,
  interviewTypeLabels,
} from "@/content/interviews";
import type {
  InterviewFormInput,
  InterviewFormValues,
} from "@/features/interviews/schemas/interview-form";
import type { InterviewCandidateOption } from "@/features/interviews/types/interview-form";
import { InterviewType } from "@/generated/prisma/enums";

type InterviewFormFieldsProps = {
  candidates: InterviewCandidateOption[];
  form: UseFormReturn<
    InterviewFormInput,
    object,
    InterviewFormValues
  >;
};

type FieldErrorProps = {
  id: string;
  message: string;
};

function FieldError({
  id,
  message,
}: FieldErrorProps) {
  return (
    <p
      className="text-sm text-destructive"
      id={id}
      role="alert"
    >
      {message}
    </p>
  );
}

export function InterviewFormFields({
  candidates,
  form,
}: InterviewFormFieldsProps) {
  const content = interviewsContent.form;
  const errors = form.formState.errors;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Controller
        control={form.control}
        name="candidateId"
        render={({ field, fieldState }) => (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="candidateId">
              {content.fields.candidate}
            </Label>

            <Select
              onValueChange={(value) =>
                field.onChange(value)
              }
              value={field.value}
            >
              <SelectTrigger
                aria-describedby={
                  fieldState.error
                    ? "candidateId-error"
                    : undefined
                }
                aria-invalid={Boolean(fieldState.error)}
                id="candidateId"
              >
                <SelectValue
                  placeholder={
                    content.placeholders.candidate
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem
                    key={candidate.id}
                    value={candidate.id}
                  >
                    {candidate.firstName}{" "}
                    {candidate.lastName} —{" "}
                    {candidate.seniority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {fieldState.error?.message ? (
              <FieldError
                id="candidateId-error"
                message={fieldState.error.message}
              />
            ) : null}
          </div>
        )}
      />

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="title">
          {content.fields.interviewTitle}
        </Label>

        <Input
          aria-describedby={
            errors.title ? "title-error" : undefined
          }
          aria-invalid={Boolean(errors.title)}
          id="title"
          placeholder={
            content.placeholders.interviewTitle
          }
          {...form.register("title")}
        />

        {errors.title?.message ? (
          <FieldError
            id="title-error"
            message={errors.title.message}
          />
        ) : null}
      </div>

      <Controller
        control={form.control}
        name="type"
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label htmlFor="type">
              {content.fields.type}
            </Label>

            <Select
              onValueChange={(value) =>
                field.onChange(value as InterviewType)
              }
              value={field.value}
            >
              <SelectTrigger
                aria-describedby={
                  fieldState.error
                    ? "type-error"
                    : undefined
                }
                aria-invalid={Boolean(fieldState.error)}
                id="type"
              >
                <SelectValue
                  placeholder={content.placeholders.type}
                />
              </SelectTrigger>

              <SelectContent>
                {Object.values(InterviewType).map(
                  (interviewType) => (
                    <SelectItem
                      key={interviewType}
                      value={interviewType}
                    >
                      {interviewTypeLabels[interviewType]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {fieldState.error?.message ? (
              <FieldError
                id="type-error"
                message={fieldState.error.message}
              />
            ) : null}
          </div>
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="scheduledAt">
          {content.fields.scheduledAt}
        </Label>

        <Input
          aria-describedby={
            errors.scheduledAt
              ? "scheduledAt-error"
              : undefined
          }
          aria-invalid={Boolean(errors.scheduledAt)}
          id="scheduledAt"
          type="datetime-local"
          {...form.register("scheduledAt")}
        />

        {errors.scheduledAt?.message ? (
          <FieldError
            id="scheduledAt-error"
            message={errors.scheduledAt.message}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="durationMinutes">
          {content.fields.duration}
        </Label>

        <Input
          aria-describedby={
            errors.durationMinutes
              ? "durationMinutes-error"
              : undefined
          }
          aria-invalid={Boolean(
            errors.durationMinutes,
          )}
          id="durationMinutes"
          max={480}
          min={15}
          step={15}
          type="number"
          {...form.register("durationMinutes", {
            valueAsNumber: true,
          })}
        />

        {errors.durationMinutes?.message ? (
          <FieldError
            id="durationMinutes-error"
            message={errors.durationMinutes.message}
          />
        ) : null}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">
          {content.fields.notes}
        </Label>

        <Textarea
          aria-describedby={
            errors.notes ? "notes-error" : undefined
          }
          aria-invalid={Boolean(errors.notes)}
          id="notes"
          placeholder={content.placeholders.notes}
          rows={5}
          {...form.register("notes")}
        />

        {errors.notes?.message ? (
          <FieldError
            id="notes-error"
            message={errors.notes.message}
          />
        ) : null}
      </div>
    </div>
  );
}