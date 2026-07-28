export type ApplicationPage =
  | "dashboard"
  | "candidates"
  | "interviews"
  | "reports"
  | "activity";

export type PageContent = {
  title: string;
  description: string;
};