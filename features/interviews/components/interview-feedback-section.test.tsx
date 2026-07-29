import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  interviewsContent,
  recommendationLabels,
} from "@/content/interviews";
import { InterviewFeedbackSection } from "@/features/interviews/components/interview-feedback-section";
import type { InterviewFeedbackDetails } from "@/features/interviews/types/interview-details";
import {
  InterviewStatus,
  Recommendation,
} from "@/generated/prisma/enums";

vi.mock(
  "@/features/interviews/components/feedback-form",
  () => ({
    FeedbackForm: ({
      interviewId,
    }: {
      interviewId: string;
    }) => (
      <div data-testid="feedback-form">
        Feedback form for {interviewId}
      </div>
    ),
  }),
);

const feedback: InterviewFeedbackDetails = {
  id: "feedback-1",
  strengths:
    "Strong technical knowledge and problem-solving skills.",
  improvementAreas:
    "Could communicate architectural trade-offs better.",
  recommendation: Recommendation.STRONG_HIRE,
  overallScore: 5,
  technicalScore: 5,
  communicationScore: null,
  additionalNotes: "A strong overall performance.",
  createdAt: new Date("2026-07-29T09:00:00.000Z"),
  updatedAt: new Date("2026-07-29T09:00:00.000Z"),
};

describe("InterviewFeedbackSection", () => {
  it("renders the feedback form for a completed interview", () => {
    render(
      <InterviewFeedbackSection
        feedback={null}
        interviewId="interview-1"
        status={InterviewStatus.COMPLETED}
      />,
    );

    expect(
      screen.getByTestId("feedback-form"),
    ).toHaveTextContent("Feedback form for interview-1");

    expect(
      screen.getByText(
        interviewsContent.feedbackForm.title,
      ),
    ).toBeInTheDocument();
  });

  it("renders submitted feedback", () => {
    render(
      <InterviewFeedbackSection
        feedback={feedback}
        interviewId="interview-1"
        status={InterviewStatus.COMPLETED}
      />,
    );

    expect(
      screen.getByText(
        interviewsContent.feedbackForm.display
          .submittedTitle,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(feedback.strengths),
    ).toBeInTheDocument();

    expect(
      screen.getByText(feedback.improvementAreas),
    ).toBeInTheDocument();

    expect(
      screen.getByText(feedback.additionalNotes!),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        recommendationLabels[
          Recommendation.STRONG_HIRE
        ],
      ),
    ).toBeInTheDocument();

    expect(screen.getAllByText("5")).toHaveLength(2);

    expect(
      screen.getByText(
        interviewsContent.feedbackForm.display.notScored,
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("feedback-form"),
    ).not.toBeInTheDocument();
  });

  it("omits additional notes when they are missing", () => {
    render(
      <InterviewFeedbackSection
        feedback={{
          ...feedback,
          additionalNotes: null,
        }}
        interviewId="interview-1"
        status={InterviewStatus.COMPLETED}
      />,
    );

    expect(
      screen.queryByText(
        interviewsContent.feedbackForm.fields
          .additionalNotes,
      ),
    ).not.toBeInTheDocument();
  });

  it("renders nothing before the interview is completed", () => {
    const { container } = render(
      <InterviewFeedbackSection
        feedback={null}
        interviewId="interview-1"
        status={InterviewStatus.SCHEDULED}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});