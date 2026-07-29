import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { reportsContent } from "@/content/reports";

const summarySkeletons = Array.from(
  { length: 4 },
  (_, index) => index,
);

const scoreSkeletons = Array.from(
  { length: 3 },
  (_, index) => index,
);

const chartSkeletons = Array.from(
  { length: 3 },
  (_, index) => index,
);

export default function ReportsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label={reportsContent.loading.label}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summarySkeletons.map((item) => (
          <Card key={item}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {scoreSkeletons.map((item) => (
              <Skeleton
                className="h-24 w-full"
                key={item}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {chartSkeletons.map((item) => (
          <Card
            className={
              item === 2 ? "xl:col-span-2" : undefined
            }
            key={item}
          >
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}