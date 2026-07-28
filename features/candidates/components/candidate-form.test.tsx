import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CandidateForm } from "@/features/candidates/components/candidate-form";
import { SeniorityLevel } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  createCandidate: vi.fn(),
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
  "@/features/candidates/server/create-candidate",
  () => ({
    createCandidate: mocks.createCandidate,
  }),
);

async function fillRequiredFields(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(
    screen.getByLabelText("First name"),
    "Alice",
  );
  await user.type(
    screen.getByLabelText("Last name"),
    "Johnson",
  );
  await user.type(
    screen.getByLabelText("Email address"),
    "alice@example.com",
  );
  await user.type(
    screen.getByLabelText("Target role"),
    "Senior Engineer",
  );
  await user.type(
    screen.getByLabelText("Years of experience"),
    "5",
  );
}

describe("CandidateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders every candidate field and available action", () => {
    render(<CandidateForm />);

    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone number")).toBeInTheDocument();
    expect(screen.getByLabelText("Current role")).toBeInTheDocument();
    expect(screen.getByLabelText("Target role")).toBeInTheDocument();
    expect(screen.getByLabelText("Seniority")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Years of experience"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Create candidate" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Cancel" }),
    ).toHaveAttribute("href", "/candidates");
  });

  it("shows client validation errors for invalid values", async () => {
    const user = userEvent.setup();

    render(<CandidateForm />);

    await user.click(
      screen.getByRole("button", { name: "Create candidate" }),
    );

    expect(
      await screen.findByText("First name is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Last name is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Target role is required."),
    ).toBeInTheDocument();

    expect(mocks.createCandidate).not.toHaveBeenCalled();
  });

  it("submits normalized values and navigates after success", async () => {
    const user = userEvent.setup();

    let resolveCreation:
      | ((value: {
          success: true;
          candidateId: string;
        }) => void)
      | undefined;

    mocks.createCandidate.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreation = resolve;
        }),
    );

    render(<CandidateForm />);

    await fillRequiredFields(user);

    await user.click(
      screen.getByRole("button", { name: "Create candidate" }),
    );

    expect(
      await screen.findByText("Creating candidate..."),
    ).toBeInTheDocument();

    expect(mocks.createCandidate).toHaveBeenCalledWith({
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      phone: null,
      currentRole: null,
      targetRole: "Senior Engineer",
      seniority: SeniorityLevel.JUNIOR,
      yearsExperience: 5,
      notes: null,
    });

    await act(async () => {
      resolveCreation?.({
        success: true,
        candidateId: "candidate-1",
      });
    });

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/candidates");
      expect(mocks.refresh).toHaveBeenCalledOnce();
    });
  });

  it("displays server and field errors", async () => {
    const user = userEvent.setup();

    mocks.createCandidate.mockResolvedValue({
      success: false,
      message: "A candidate with this email already exists.",
      fieldErrors: {
        email: ["A candidate with this email already exists."],
      },
    });

    render(<CandidateForm />);
    await fillRequiredFields(user);

    await user.click(
      screen.getByRole("button", { name: "Create candidate" }),
    );

    expect(
      await screen.findAllByText(
        "A candidate with this email already exists.",
      ),
    ).toHaveLength(2);

    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("displays a general server error", async () => {
    const user = userEvent.setup();

    mocks.createCandidate.mockResolvedValue({
      success: false,
      message: "Unable to create the candidate. Please try again.",
    });

    render(<CandidateForm />);
    await fillRequiredFields(user);

    await user.click(
      screen.getByRole("button", { name: "Create candidate" }),
    );

    expect(
      await screen.findByText(
        "Unable to create the candidate. Please try again.",
      ),
    ).toBeInTheDocument();

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("converts a cleared experience value to null", async () => {
  const user = userEvent.setup();

  mocks.createCandidate.mockResolvedValue({
    success: true,
    candidateId: "candidate-2",
  });

  render(<CandidateForm />);

  await fillRequiredFields(user);

  const experienceInput = screen.getByLabelText(
    "Years of experience",
  );

  await user.clear(experienceInput);

  await user.click(
    screen.getByRole("button", { name: "Create candidate" }),
  );

  await waitFor(() => {
    expect(mocks.createCandidate).toHaveBeenCalledWith(
      expect.objectContaining({
        yearsExperience: null,
      }),
    );
  });

  expect(mocks.push).toHaveBeenCalledWith("/candidates");
  expect(mocks.refresh).toHaveBeenCalledOnce();
});
});