"use client";

import {
  type MouseEvent,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { CircleCheckBig } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { interviewsContent } from "@/content/interviews";
import { completeInterview } from "@/features/interviews/server/complete-interview";
import { InterviewStatus } from "@/generated/prisma/enums";

type CompleteInterviewButtonProps = {
  interviewId: string;
  status: InterviewStatus;
};

export function CompleteInterviewButton({
  interviewId,
  status,
}: CompleteInterviewButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const canComplete =
    status === InterviewStatus.SCHEDULED ||
    status === InterviewStatus.IN_PROGRESS;

  if (!canComplete) {
    return null;
  }

  const content = interviewsContent.details;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setError(null);
    }
  }

  function handleComplete(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await completeInterview(interviewId);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog
      onOpenChange={handleOpenChange}
      open={open}
    >
      <AlertDialogTrigger
        render={
          <Button type="button">
            <CircleCheckBig
              aria-hidden="true"
              className="size-4"
            />
            {content.actions.complete}
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {content.completeDialog.title}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {content.completeDialog.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <p
            aria-live="polite"
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {content.completeDialog.cancel}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={handleComplete}
          >
            {isPending
              ? content.actions.completing
              : content.completeDialog.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}