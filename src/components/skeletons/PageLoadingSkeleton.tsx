import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Space */}
      <div className="h-16" />
      
      {/* Content */}
      <div className="flex-1 container max-w-7xl py-6 px-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Bottom Navigation Space */}
      <div className="h-16 md:h-0" />
    </div>
  );
}
