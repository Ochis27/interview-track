import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  interviewsContent,
  recommendationLabels,
} from "@/content/interviews";
import { FeedbackForm } from "@/features/interviews/components/feedback-form";
import { Recommendation } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  createFeedback: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

vi.mock(
  "@/features/interviews/server/create-feedback",
  () => ({
    createFeedback: mocks.createFeedback,
  }),
);

const interviewId = "interview-1";
const content = interviewsContent.feedbackForm;
const UI_TEST_TIMEOUT = 15_000;

const validFeedback = {
  strengths:
    "Strong technical knowledge and problem-solving skills.",
  improvementAreas:
    "Could communicate technical trade-offs more clearly.",
  recommendation: Recommendation.STRONG_HIRE,
  overallScore: 5,
  technicalScore: 5,
  communicationScore: 4,
  additionalNotes:
    "The candidate performed well during the interview.",
} as const;

async function fillValidFeedback(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(
    screen.getByRole("textbox", {
      name: content.fields.strengths,
    }),
    validFeedback.strengths,
  );

  await user.type(
    screen.getByRole("textbox", {
      name: content.fields.improvementAreas,
    }),
    validFeedback.improvementAreas,
  );

  await user.click(
    screen.getByRole("combobox", {
      name: content.fields.recommendation,
    }),
  );

  await user.click(
    await screen.findByRole("option", {
      name: recommendationLabels[
        Recommendation.STRONG_HIRE
      ],
    }),
  );

  const overallScore = screen.getByRole("spinbutton", {
    name: content.fields.overallScore,
  });

  await user.clear(overallScore);
  await user.type(
    overallScore,
    String(validFeedback.overallScore),
  );

  const technicalScore = screen.getByRole(
    "spinbutton",
    {
      name: content.fields.technicalScore,
    },
  );

  await user.clear(technicalScore);
  await user.type(
    technicalScore,
    String(validFeedback.technicalScore),
  );

  const communicationScore = screen.getByRole(
    "spinbutton",
    {
      name: content.fields.communicationScore,
    },
  );

  await user.clear(communicationScore);
  await user.type(
    communicationScore,
    String(validFeedback.communicationScore),
  );

  await user.type(
    screen.getByRole("textbox", {
      name: content.fields.additionalNotes,
    }),
    validFeedback.additionalNotes,
  );
}

async function submitValidFeedback(
  user: ReturnType<typeof userEvent.setup>,
) {
  await fillValidFeedback(user);

  await user.click(
    screen.getByRole("button", {
      name: content.submit,
    }),
  );
}

describe(
  "FeedbackForm",
  {
    timeout: UI_TEST_TIMEOUT,
  },
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("renders all fields and the submit action", () => {
      render(
        <FeedbackForm interviewId={interviewId} />,
      );

      expect(
        screen.getByRole("textbox", {
          name: content.fields.strengths,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("textbox", {
          name: content.fields.improvementAreas,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("combobox", {
          name: content.fields.recommendation,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("spinbutton", {
          name: content.fields.overallScore,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("spinbutton", {
          name: content.fields.technicalScore,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("spinbutton", {
          name: content.fields.communicationScore,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("textbox", {
          name: content.fields.additionalNotes,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: content.submit,
        }),
      ).toBeEnabled();
    });

    it("shows client validation errors", async () => {
      const user = userEvent.setup();

      render(
        <FeedbackForm interviewId={interviewId} />,
      );

      await user.click(
        screen.getByRole("button", {
          name: content.submit,
        }),
      );

      expect(
        await screen.findByText(
          content.validation.strengthsMinimum,
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          content.validation.improvementMinimum,
        ),
      ).toBeInTheDocument();

      expect(
        mocks.createFeedback,
      ).not.toHaveBeenCalled();

      expect(mocks.refresh).not.toHaveBeenCalled();
    });

    it(
      "submits feedback and refreshes the page",
      async () => {
        const user = userEvent.setup();

        mocks.createFeedback.mockResolvedValue({
          success: true,
          feedbackId: "feedback-1",
        });

        render(
          <FeedbackForm interviewId={interviewId} />,
        );

        await submitValidFeedback(user);

        await waitFor(() => {
          expect(
            mocks.createFeedback,
          ).toHaveBeenCalledWith(
            interviewId,
            validFeedback,
          );
        });

        await waitFor(() => {
          expect(mocks.refresh).toHaveBeenCalledTimes(
            1,
          );
        });
      },
    );

    it(
      "displays server and field errors",
      async () => {
        const user = userEvent.setup();

        mocks.createFeedback.mockResolvedValue({
          success: false,
          message: "Unable to submit feedback.",
          fieldErrors: {
            strengths: [
              "Add more detail about the candidate's strengths.",
            ],
          },
        });

        render(
          <FeedbackForm interviewId={interviewId} />,
        );

        await submitValidFeedback(user);

        expect(
          await screen.findByText(
            "Unable to submit feedback.",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Add more detail about the candidate's strengths.",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole("textbox", {
            name: content.fields.strengths,
          }),
        ).toHaveAttribute("aria-invalid", "true");

        expect(mocks.refresh).not.toHaveBeenCalled();
      },
    );

    it(
      "displays a general server error",
      async () => {
        const user = userEvent.setup();

        mocks.createFeedback.mockResolvedValue({
          success: false,
          message: content.errors.creationFailed,
        });

        render(
          <FeedbackForm interviewId={interviewId} />,
        );

        await submitValidFeedback(user);

        expect(
          await screen.findByText(
            content.errors.creationFailed,
          ),
        ).toBeInTheDocument();

        expect(mocks.refresh).not.toHaveBeenCalled();
      },
    );

    it(
      "shows the pending submission state",
      async () => {
        const user = userEvent.setup();

        let resolveRequest:
          | ((result: {
              success: true;
              feedbackId: string;
            }) => void)
          | undefined;

        mocks.createFeedback.mockReturnValue(
          new Promise((resolve) => {
            resolveRequest = resolve;
          }),
        );

        render(
          <FeedbackForm interviewId={interviewId} />,
        );

        await submitValidFeedback(user);

        await waitFor(() => {
          expect(
            mocks.createFeedback,
          ).toHaveBeenCalledTimes(1);
        });

        expect(
          screen.getByRole("button", {
            name: content.submitting,
          }),
        ).toBeDisabled();

        resolveRequest?.({
          success: true,
          feedbackId: "feedback-1",
        });

        await waitFor(() => {
          expect(mocks.refresh).toHaveBeenCalledTimes(
            1,
          );
        });
      },
    );
  },
);