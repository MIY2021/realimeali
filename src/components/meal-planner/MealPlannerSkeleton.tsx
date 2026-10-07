import { Skeleton } from "@/components/ui/skeleton";

export default function MealPlannerSkeleton() {
  return (
    <div className="container max-w-5xl py-4 px-4 sm:py-8 sm:px-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-44 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="overflow-hidden rounded-2xl border bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-3">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
