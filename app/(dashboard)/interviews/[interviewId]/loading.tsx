import { Skeleton } from "@/components/ui/skeleton";
import { interviewsContent } from "@/content/interviews";

const overviewItems = Array.from(
  { length: 4 },
  (_, index) => index,
);

export default function InterviewDetailsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label={
        interviewsContent.details.loadingLabel
      }
      className="mx-auto max-w-5xl space-y-6"
    >
      <Skeleton className="h-8 w-40" />

      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="space-y-6 rounded-lg border p-6">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {overviewItems.map((item) => (
            <div
              className="flex items-center gap-3"
              key={item}
            >
              <Skeleton className="size-9" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />

        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}