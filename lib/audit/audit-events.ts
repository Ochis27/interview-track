export const auditActions = {
  candidateCreated: "CANDIDATE_CREATED",
  interviewCreated: "INTERVIEW_CREATED",
  interviewCompleted: "INTERVIEW_COMPLETED",
  feedbackSubmitted: "FEEDBACK_SUBMITTED",
} as const;

export const auditEntityTypes = {
  candidate: "Candidate",
  interview: "InterviewSession",
  feedback: "Feedback",
} as const;