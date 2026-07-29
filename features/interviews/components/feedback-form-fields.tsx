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
  recommendationLabels,
} from "@/content/interviews";
import {
  type FeedbackFormInput,
  type FeedbackFormValues,
} from "@/features/interviews/schemas/feedback-form";
import { Recommendation } from "@/generated/prisma/enums";

type FeedbackFormFieldsProps = {
  form: UseFormReturn<
    FeedbackFormInput,
    object,
    FeedbackFormValues
  >;
};

type FieldErrorProps = {
  id: string;
  message: string;
};

type ScoreFieldName =
  | "overallScore"
  | "technicalScore"
  | "communicationScore";

type ScoreFieldProps = {
  form: FeedbackFormFieldsProps["form"];
  label: string;
  name: ScoreFieldName;
  optional?: boolean;
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

function ScoreField({
  form,
  label,
  name,
  optional = false,
}: ScoreFieldProps) {
  const error = form.formState.errors[name];
  const content = interviewsContent.feedbackForm;
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Input
        aria-describedby={
          error
            ? `${hintId} ${errorId}`
            : hintId
        }
        aria-invalid={Boolean(error)}
        id={name}
        max={5}
        min={1}
        step={1}
        type="number"
        {...form.register(
          name,
          optional
            ? {
                setValueAs: (value: string) =>
                  value === ""
                    ? null
                    : Number(value),
              }
            : {
                valueAsNumber: true,
              },
        )}
      />

      <p
        className="text-xs text-muted-foreground"
        id={hintId}
      >
        {content.scoreHint}
      </p>

      {error?.message ? (
        <FieldError
          id={errorId}
          message={error.message}
        />
      ) : null}
    </div>
  );
}

export function FeedbackFormFields({
  form,
}: FeedbackFormFieldsProps) {
  const content = interviewsContent.feedbackForm;
  const errors = form.formState.errors;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="strengths">
          {content.fields.strengths}
        </Label>

        <Textarea
          aria-describedby={
            errors.strengths
              ? "strengths-error"
              : undefined
          }
          aria-invalid={Boolean(errors.strengths)}
          id="strengths"
          placeholder={content.placeholders.strengths}
          rows={5}
          {...form.register("strengths")}
        />

        {errors.strengths?.message ? (
          <FieldError
            id="strengths-error"
            message={errors.strengths.message}
          />
        ) : null}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="improvementAreas">
          {content.fields.improvementAreas}
        </Label>

        <Textarea
          aria-describedby={
            errors.improvementAreas
              ? "improvementAreas-error"
              : undefined
          }
          aria-invalid={Boolean(
            errors.improvementAreas,
          )}
          id="improvementAreas"
          placeholder={
            content.placeholders.improvementAreas
          }
          rows={5}
          {...form.register("improvementAreas")}
        />

        {errors.improvementAreas?.message ? (
          <FieldError
            id="improvementAreas-error"
            message={
              errors.improvementAreas.message
            }
          />
        ) : null}
      </div>

      <Controller
        control={form.control}
        name="recommendation"
        render={({ field, fieldState }) => (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="recommendation">
              {content.fields.recommendation}
            </Label>

            <Select
              onValueChange={(value) =>
                field.onChange(
                  value as Recommendation,
                )
              }
              value={field.value}
            >
              <SelectTrigger
                aria-describedby={
                  fieldState.error
                    ? "recommendation-error"
                    : undefined
                }
                aria-invalid={Boolean(
                  fieldState.error,
                )}
                id="recommendation"
              >
                <SelectValue
                  placeholder={
                    content.placeholders
                      .recommendation
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {Object.values(Recommendation).map(
                  (recommendation) => (
                    <SelectItem
                      key={recommendation}
                      value={recommendation}
                    >
                      {
                        recommendationLabels[
                          recommendation
                        ]
                      }
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {fieldState.error?.message ? (
              <FieldError
                id="recommendation-error"
                message={fieldState.error.message}
              />
            ) : null}
          </div>
        )}
      />

      <ScoreField
        form={form}
        label={content.fields.overallScore}
        name="overallScore"
      />

      <ScoreField
        form={form}
        label={content.fields.technicalScore}
        name="technicalScore"
        optional
      />

      <ScoreField
        form={form}
        label={content.fields.communicationScore}
        name="communicationScore"
        optional
      />

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="additionalNotes">
          {content.fields.additionalNotes}
        </Label>

        <Textarea
          aria-describedby={
            errors.additionalNotes
              ? "additionalNotes-error"
              : undefined
          }
          aria-invalid={Boolean(
            errors.additionalNotes,
          )}
          id="additionalNotes"
          placeholder={
            content.placeholders.additionalNotes
          }
          rows={4}
          {...form.register("additionalNotes")}
        />

        {errors.additionalNotes?.message ? (
          <FieldError
            id="additionalNotes-error"
            message={errors.additionalNotes.message}
          />
        ) : null}
      </div>
    </div>
  );
}