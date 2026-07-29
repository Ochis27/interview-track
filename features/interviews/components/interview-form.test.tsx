import {
  fireEvent,
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

import { interviewsContent } from "@/content/interviews";
import { InterviewForm } from "@/features/interviews/components/interview-form";
import type { InterviewCandidateOption } from "@/features/interviews/types/interview-form";
import { SeniorityLevel } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  createInterview: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock(
  "@/features/interviews/server/create-interview",
  () => ({
    createInterview: mocks.createInterview,
  }),
);

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

async function completeForm() {
  const user = userEvent.setup();

  await user.click(
    screen.getByRole("combobox", {
      name: "Candidate",
    }),
  );

  await user.click(
    await screen.findByRole("option", {
      name: "Ada Lovelace — SENIOR",
    }),
  );

  fireEvent.change(
    screen.getByRole("textbox", {
      name: "Interview title",
    }),
    {
      target: {
        value: "Senior frontend interview",
      },
    },
  );

  fireEvent.change(
    screen.getByLabelText(
      "Scheduled date and time",
    ),
    {
      target: {
        value: "2026-07-30T14:30",
      },
    },
  );

  fireEvent.change(
    screen.getByRole("spinbutton", {
      name: "Duration in minutes",
    }),
    {
      target: {
        value: "90",
      },
    },
  );

  fireEvent.change(
    screen.getByRole("textbox", {
      name: "Notes",
    }),
    {
      target: {
        value: "Focus on architecture.",
      },
    },
  );

  return user;
}

describe("InterviewForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all interview fields and actions", () => {
    render(<InterviewForm candidates={candidates} />);

    expect(
      screen.getByRole("combobox", {
        name: "Candidate",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Interview title",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", {
        name: "Interview type",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Scheduled date and time",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("spinbutton", {
        name: "Duration in minutes",
      }),
    ).toHaveValue(60);

    expect(
      screen.getByRole("textbox", {
        name: "Notes",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cancel",
      }),
    ).toHaveAttribute("href", "/interviews");

    expect(
      screen.getByRole("button", {
        name: "Schedule interview",
      }),
    ).toBeEnabled();
  });

  it("disables submission when no candidates exist", () => {
    render(<InterviewForm candidates={[]} />);

    expect(
      screen.getByText(
        interviewsContent.form.noCandidates,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Schedule interview",
      }),
    ).toBeDisabled();
  });

  it("shows client validation errors", async () => {
    const user = userEvent.setup();

    render(<InterviewForm candidates={candidates} />);

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
        name: "Schedule interview",
      }),
    );

    const validation =
      interviewsContent.form.validation;

    expect(
      await screen.findByText(
        validation.candidateRequired,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(validation.titleMinimum),
    ).toBeInTheDocument();

    expect(
      screen.getByText(validation.dateRequired),
    ).toBeInTheDocument();

    expect(
      screen.getByText(validation.durationMinimum),
    ).toBeInTheDocument();

    expect(
      screen.getByText(validation.notesMaximum),
    ).toBeInTheDocument();

    expect(
      mocks.createInterview,
    ).not.toHaveBeenCalled();
  });

  it("submits normalized values and navigates", async () => {
    mocks.createInterview.mockResolvedValue({
      success: true,
      interviewId: "interview-1",
    });

    render(<InterviewForm candidates={candidates} />);

    const user = await completeForm();

    await user.click(
      screen.getByRole("button", {
        name: "Schedule interview",
      }),
    );

    await waitFor(() => {
      expect(mocks.createInterview).toHaveBeenCalledWith({
        candidateId: "candidate-1",
        title: "Senior frontend interview",
        type: "TECHNICAL",
        scheduledAt: new Date(
          "2026-07-30T14:30",
        ).toISOString(),
        durationMinutes: 90,
        notes: "Focus on architecture.",
      });
    });

    expect(mocks.push).toHaveBeenCalledWith(
      "/interviews",
    );
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("displays server and field errors", async () => {
    mocks.createInterview.mockResolvedValue({
      success: false,
      message: "Unable to schedule interview.",
      fieldErrors: {
        title: ["This interview title is unavailable."],
      },
    });

    render(<InterviewForm candidates={candidates} />);

    const user = await completeForm();

    await user.click(
      screen.getByRole("button", {
        name: "Schedule interview",
      }),
    );

    expect(
      await screen.findByText(
        "Unable to schedule interview.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This interview title is unavailable.",
      ),
    ).toBeInTheDocument();

    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("displays a general server error", async () => {
    mocks.createInterview.mockResolvedValue({
      success: false,
      message:
        interviewsContent.form.errors.creationFailed,
    });

    render(<InterviewForm candidates={candidates} />);

    const user = await completeForm();

    await user.click(
      screen.getByRole("button", {
        name: "Schedule interview",
      }),
    );

    expect(
      await screen.findByText(
        interviewsContent.form.errors.creationFailed,
      ),
    ).toBeInTheDocument();

    expect(mocks.push).not.toHaveBeenCalled();
  });
});