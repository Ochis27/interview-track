import { Skeleton } from "@/components/ui/skeleton";
import { activityContent } from "@/content/activity";

const columnSkeletons = Array.from(
  { length: 7 },
  (_, index) => index,
);

const rowSkeletons = Array.from(
  { length: 6 },
  (_, index) => index,
);

export default function ActivityLoading() {
  return (
    <div
      aria-busy="true"
      aria-label={activityContent.loading.label}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-full sm:w-48" />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-7 gap-4 border-b bg-muted/40 px-4 py-3">
          {columnSkeletons.map((column) => (
            <Skeleton
              className="h-4 w-full"
              key={column}
            />
          ))}
        </div>

        {rowSkeletons.map((row) => (
          <div
            className="grid grid-cols-7 gap-4 border-b px-4 py-4 last:border-b-0"
            key={row}
          >
            {columnSkeletons.map((column) => (
              <Skeleton
                className="h-5 w-full"
                key={column}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-64" />
      </div>
    </div>
  );
}