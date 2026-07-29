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
import { FeedbackFormFields } from "@/features/interviews/components/feedback-form-fields";
import {
  feedbackFormSchema,
  type FeedbackFormInput,
  type FeedbackFormValues,
} from "@/features/interviews/schemas/feedback-form";
import { Recommendation } from "@/generated/prisma/enums";

const defaultValues: FeedbackFormInput = {
  strengths: "",
  improvementAreas: "",
  recommendation: Recommendation.CONTINUE_PRACTICE,
  overallScore: 3,
  technicalScore: null,
  communicationScore: null,
  additionalNotes: "",
};

type FieldsHarnessProps = {
  onSubmit: (values: FeedbackFormValues) => void;
};

function FieldsHarness({
  onSubmit,
}: FieldsHarnessProps) {
  const form = useForm<
    FeedbackFormInput,
    object,
    FeedbackFormValues
  >({
    defaultValues,
    resolver: zodResolver(feedbackFormSchema),
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FeedbackFormFields form={form} />
      <button type="submit">Save feedback fields</button>
    </form>
  );
}

describe("FeedbackFormFields", () => {
  it("renders and submits all feedback values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FieldsHarness onSubmit={onSubmit} />);

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Strengths",
      }),
      {
        target: {
          value: "Strong technical knowledge.",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Improvement areas",
      }),
      {
        target: {
          value: "Could explain trade-offs better.",
        },
      },
    );

    await user.click(
      screen.getByRole("combobox", {
        name: "Recommendation",
      }),
    );

    await user.click(
      await screen.findByRole("option", {
        name: "Strong hire",
      }),
    );

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "Overall score",
      }),
      {
        target: {
          value: "5",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "Technical score",
      }),
      {
        target: {
          value: "4",
        },
      },
    );

    const communicationScore = screen.getByRole(
      "spinbutton",
      {
        name: "Communication score",
      },
    );

    fireEvent.change(communicationScore, {
      target: {
        value: "3",
      },
    });

    fireEvent.change(communicationScore, {
      target: {
        value: "",
      },
    });

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Additional notes",
      }),
      {
        target: {
          value: "   ",
        },
      },
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save feedback fields",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          strengths: "Strong technical knowledge.",
          improvementAreas:
            "Could explain trade-offs better.",
          recommendation: Recommendation.STRONG_HIRE,
          overallScore: 5,
          technicalScore: 4,
          communicationScore: null,
          additionalNotes: null,
        },
        expect.anything(),
      );
    });
  });

  it("renders validation errors and invalid states", async () => {
    const user = userEvent.setup();

    render(<FieldsHarness onSubmit={vi.fn()} />);

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Strengths",
      }),
      {
        target: {
          value: "a",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Improvement areas",
      }),
      {
        target: {
          value: "b",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "Overall score",
      }),
      {
        target: {
          value: "0",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "Technical score",
      }),
      {
        target: {
          value: "6",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "Communication score",
      }),
      {
        target: {
          value: "3.5",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Additional notes",
      }),
      {
        target: {
          value: "a".repeat(2_001),
        },
      },
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save feedback fields",
      }),
    );

    const validation =
      interviewsContent.feedbackForm.validation;

    expect(
      await screen.findByText(
        validation.strengthsMinimum,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        validation.improvementMinimum,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(validation.scoreMinimum),
    ).toBeInTheDocument();

    expect(
      screen.getByText(validation.scoreMaximum),
    ).toBeInTheDocument();

    expect(
      screen.getByText(validation.scoreInteger),
    ).toBeInTheDocument();

    expect(
      screen.getByText(validation.notesMaximum),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Strengths",
      }),
    ).toHaveAttribute("aria-invalid", "true");

    expect(
      screen.getByRole("textbox", {
        name: "Improvement areas",
      }),
    ).toHaveAttribute("aria-invalid", "true");

    expect(
      screen.getByRole("spinbutton", {
        name: "Overall score",
      }),
    ).toHaveAttribute("aria-invalid", "true");

    expect(
      screen.getByRole("spinbutton", {
        name: "Technical score",
      }),
    ).toHaveAttribute("aria-invalid", "true");

    expect(
      screen.getByRole("spinbutton", {
        name: "Communication score",
      }),
    ).toHaveAttribute("aria-invalid", "true");

    expect(
      screen.getByRole("textbox", {
        name: "Additional notes",
      }),
    ).toHaveAttribute("aria-invalid", "true");
  });
});