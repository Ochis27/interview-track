import { zodResolver } from "@hookform/resolvers/zod";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { interviewsContent } from "@/content/interviews";
import { InterviewFormFields } from "@/features/interviews/components/interview-form-fields";
import {
  interviewFormSchema,
  type InterviewFormInput,
  type InterviewFormValues,
} from "@/features/interviews/schemas/interview-form";
import type { InterviewCandidateOption } from "@/features/interviews/types/interview-form";
import {
  InterviewType,
  SeniorityLevel,
} from "@/generated/prisma/enums";

const INTERACTION_TEST_TIMEOUT = 15_000;

const candidates: InterviewCandidateOption[] = [
  {
    id: "candidate-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    seniority: SeniorityLevel.SENIOR,
  },
  {
    id: "candidate-2",
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
    seniority: SeniorityLevel.LEAD,
  },
];

const defaultValues: InterviewFormInput = {
  candidateId: "",
  title: "",
  type: InterviewType.TECHNICAL,
  scheduledAt: "",
  durationMinutes: 60,
  notes: "",
};

type FieldsHarnessProps = {
  onSubmit: (values: InterviewFormValues) => void;
};

function FieldsHarness({
  onSubmit,
}: FieldsHarnessProps) {
  const form = useForm<
    InterviewFormInput,
    object,
    InterviewFormValues
  >({
    defaultValues,
    resolver: zodResolver(interviewFormSchema),
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <InterviewFormFields
        candidates={candidates}
        form={form}
      />

      <button type="submit">Save fields</button>
    </form>
  );
}

describe("InterviewFormFields", () => {
  it(
    "renders and submits values from every field",
    async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<FieldsHarness onSubmit={onSubmit} />);

      await user.click(
        screen.getByRole("combobox", {
          name: "Candidate",
        }),
      );

      expect(
        await screen.findByRole("option", {
          name: "Grace Hopper — LEAD",
        }),
      ).toBeInTheDocument();

      const adaOption = screen.getByRole("option", {
        name: "Ada Lovelace — SENIOR",
      });

      await user.click(adaOption);

      fireEvent.change(
        screen.getByRole("textbox", {
          name: "Interview title",
        }),
        {
          target: {
            value: "Behavioral interview",
          },
        },
      );

      await user.click(
        screen.getByRole("combobox", {
          name: "Interview type",
        }),
      );

      const behavioralOption =
        await screen.findByRole("option", {
          name: "Behavioral",
        });

      await user.click(behavioralOption);

      fireEvent.change(
        screen.getByLabelText(
          "Scheduled date and time",
        ),
        {
          target: {
            value: "2026-08-01T09:30",
          },
        },
      );

      fireEvent.change(
        screen.getByRole("spinbutton", {
          name: "Duration in minutes",
        }),
        {
          target: {
            value: "45",
          },
        },
      );

      fireEvent.change(
        screen.getByRole("textbox", {
          name: "Notes",
        }),
        {
          target: {
            value: "Discuss team collaboration.",
          },
        },
      );

      await user.click(
        screen.getByRole("button", {
          name: "Save fields",
        }),
      );

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);

        expect(onSubmit).toHaveBeenCalledWith(
          {
            candidateId: "candidate-1",
            title: "Behavioral interview",
            type: InterviewType.BEHAVIORAL,
            scheduledAt: new Date(
              "2026-08-01T09:30",
            ),
            durationMinutes: 45,
            notes: "Discuss team collaboration.",
          },
          expect.anything(),
        );
      });
    },
    INTERACTION_TEST_TIMEOUT,
  );

  it(
    "renders validation messages and invalid states",
    async () => {
      const user = userEvent.setup();

      render(<FieldsHarness onSubmit={vi.fn()} />);

      fireEvent.change(
        screen.getByRole("spinbutton", {
          name: "Duration in minutes",
        }),
        {
          target: {
            value: "10",
          },
        },
      );

      fireEvent.change(
        screen.getByRole("textbox", {
          name: "Notes",
        }),
        {
          target: {
            value: "a".repeat(2_001),
          },
        },
      );

      await user.click(
        screen.getByRole("button", {
          name: "Save fields",
        }),
      );

      const validation =
        interviewsContent.form.validation;

      await waitFor(
        () => {
          expect(
            screen.getByText(
              validation.candidateRequired,
            ),
          ).toBeInTheDocument();

          expect(
            screen.getByText(
              validation.titleMinimum,
            ),
          ).toBeInTheDocument();

          expect(
            screen.getByText(
              validation.dateRequired,
            ),
          ).toBeInTheDocument();

          expect(
            screen.getByText(
              validation.durationMinimum,
            ),
          ).toBeInTheDocument();

          expect(
            screen.getByText(
              validation.notesMaximum,
            ),
          ).toBeInTheDocument();
        },
        {
          timeout: 5_000,
        },
      );

      expect(
        screen.getByRole("combobox", {
          name: "Candidate",
        }),
      ).toHaveAttribute("aria-invalid", "true");

      expect(
        screen.getByRole("textbox", {
          name: "Interview title",
        }),
      ).toHaveAttribute("aria-invalid", "true");

      expect(
        screen.getByLabelText(
          "Scheduled date and time",
        ),
      ).toHaveAttribute("aria-invalid", "true");

      expect(
        screen.getByRole("spinbutton", {
          name: "Duration in minutes",
        }),
      ).toHaveAttribute("aria-invalid", "true");

      expect(
        screen.getByRole("textbox", {
          name: "Notes",
        }),
      ).toHaveAttribute("aria-invalid", "true");
    },
    INTERACTION_TEST_TIMEOUT,
  );
});