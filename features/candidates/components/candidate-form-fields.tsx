"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

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
import { candidatesContent } from "@/content/candidates";
import type {
  CandidateFormInput,
  CandidateFormValues,
} from "@/features/candidates/schemas/candidate-form";

type CandidateFormFieldsProps = {
  form: UseFormReturn<
    CandidateFormInput,
    object,
    CandidateFormValues
  >;
};

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  ) : null;
}

export function CandidateFormFields({
  form,
}: CandidateFormFieldsProps) {
  const {
    control,
    formState: { errors },
    register,
  } = form;

  const content = candidatesContent.form;
  const fields = content.fields;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="firstName">{fields.firstName.label}</Label>
        <Input
          aria-invalid={Boolean(errors.firstName)}
          id="firstName"
          placeholder={fields.firstName.placeholder}
          {...register("firstName")}
        />
        <FieldError message={errors.firstName?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">{fields.lastName.label}</Label>
        <Input
          aria-invalid={Boolean(errors.lastName)}
          id="lastName"
          placeholder={fields.lastName.placeholder}
          {...register("lastName")}
        />
        <FieldError message={errors.lastName?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{fields.email.label}</Label>
        <Input
          aria-invalid={Boolean(errors.email)}
          id="email"
          placeholder={fields.email.placeholder}
          type="email"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{fields.phone.label}</Label>
        <Input
          aria-invalid={Boolean(errors.phone)}
          id="phone"
          placeholder={fields.phone.placeholder}
          type="tel"
          {...register("phone")}
        />
        <FieldError message={errors.phone?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentRole">
          {fields.currentRole.label}
        </Label>
        <Input
          aria-invalid={Boolean(errors.currentRole)}
          id="currentRole"
          placeholder={fields.currentRole.placeholder}
          {...register("currentRole")}
        />
        <FieldError message={errors.currentRole?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetRole">
          {fields.targetRole.label}
        </Label>
        <Input
          aria-invalid={Boolean(errors.targetRole)}
          id="targetRole"
          placeholder={fields.targetRole.placeholder}
          {...register("targetRole")}
        />
        <FieldError message={errors.targetRole?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seniority">
          {fields.seniority.label}
        </Label>

        <Controller
          control={control}
          name="seniority"
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger
                aria-invalid={Boolean(errors.seniority)}
                id="seniority"
              >
                <SelectValue
                  placeholder={content.seniorityPlaceholder}
                />
              </SelectTrigger>

              <SelectContent>
                {Object.entries(
                  candidatesContent.seniority,
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <FieldError message={errors.seniority?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsExperience">
          {fields.yearsExperience.label}
        </Label>
        <Input
          aria-invalid={Boolean(errors.yearsExperience)}
          id="yearsExperience"
          min={0}
          max={60}
          placeholder={fields.yearsExperience.placeholder}
          type="number"
          {...register("yearsExperience", {
            setValueAs: (value: string) =>
              value === "" ? null : Number(value),
          })}
        />
        <FieldError message={errors.yearsExperience?.message} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">{fields.notes.label}</Label>
        <Textarea
          aria-invalid={Boolean(errors.notes)}
          id="notes"
          placeholder={fields.notes.placeholder}
          rows={5}
          {...register("notes")}
        />
        <FieldError message={errors.notes?.message} />
      </div>
    </div>
  );
}