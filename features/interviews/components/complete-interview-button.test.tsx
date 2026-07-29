import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { CompleteInterviewButton } from "@/features/interviews/components/complete-interview-button";
import { InterviewStatus } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  completeInterview: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mocks.refresh,
  }),
}));

vi.mock(
  "@/features/interviews/server/complete-interview",
  () => ({
    completeInterview: mocks.completeInterview,
  }),
);

describe("CompleteInterviewButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    InterviewStatus.COMPLETED,
    InterviewStatus.CANCELLED,
  ])("hides the action for %s interviews", (status) => {
    render(
      <CompleteInterviewButton
        interviewId="interview-1"
        status={status}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: "Complete interview",
      }),
    ).not.toBeInTheDocument();
  });

  it.each([
    InterviewStatus.SCHEDULED,
    InterviewStatus.IN_PROGRESS,
  ])("shows the action for %s interviews", (status) => {
    render(
      <CompleteInterviewButton
        interviewId="interview-1"
        status={status}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Complete interview",
      }),
    ).toBeEnabled();
  });

  it("completes the interview and refreshes the page", async () => {
    const user = userEvent.setup();

    mocks.completeInterview.mockResolvedValue({
      success: true,
    });

    render(
      <CompleteInterviewButton
        interviewId="interview-1"
        status={InterviewStatus.SCHEDULED}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Complete interview",
      }),
    );

    expect(
      await screen.findByRole("alertdialog"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Complete interview?"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Complete interview",
      }),
    );

    await waitFor(() => {
      expect(
        mocks.completeInterview,
      ).toHaveBeenCalledWith("interview-1");
    });

    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("displays a completion error", async () => {
    const user = userEvent.setup();

    mocks.completeInterview.mockResolvedValue({
      success: false,
      message: "Unable to complete interview.",
    });

    render(
      <CompleteInterviewButton
        interviewId="interview-1"
        status={InterviewStatus.SCHEDULED}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Complete interview",
      }),
    );

    const buttons = screen.getAllByRole("button", {
      name: "Complete interview",
    });

    await user.click(buttons.at(-1)!);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Unable to complete interview.",
    );

    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});