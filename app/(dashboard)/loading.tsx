import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardContent } from "@/content/dashboard";

export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-label={dashboardContent.loadingLabel}
      className="space-y-8"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardContent.summaryCards.map(
          ({ key }) => (
            <Card key={key}>
              <CardHeader>
                <Skeleton className="h-4 w-28" />
              </CardHeader>

              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-20 w-full"
              />
            ),
          )}
        </CardContent>
      </Card>
    </div>
  );
}