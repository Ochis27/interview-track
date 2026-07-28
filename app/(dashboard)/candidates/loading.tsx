import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidatesLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-9 w-full max-w-xl" />
        <Skeleton className="h-9 w-24" />
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              className="grid grid-cols-2 gap-4 md:grid-cols-6"
              key={index}
            >
              <Skeleton className="col-span-2 h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}