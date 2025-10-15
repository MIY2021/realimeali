import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarDays } from "lucide-react";

export default function MealPlannerSkeleton() {
  const isMobile = useIsMobile();

  return (
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6 space-y-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#F5B82E', stroke: '#F5B82E' }} />
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Meal Planner</h1>
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Actions skeleton */}
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        <Skeleton className={`h-10 ${isMobile ? 'w-20' : 'w-24'}`} />
        <Skeleton className={`h-10 ${isMobile ? 'w-16' : 'w-20'}`} />
        <Skeleton className={`h-10 ${isMobile ? 'w-20' : 'w-24'}`} />
        <Skeleton className={`h-10 ${isMobile ? 'w-24' : 'w-28'}`} />
      </div>

      {/* Week selector skeleton */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Meal sections skeleton */}
      {["Breakfast", "Lunch", "Dinner", "Snacks"].map((mealType) => (
        <Card key={mealType} className="w-full">
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="space-y-3">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              
              {/* Meal items */}
              <div className="space-y-2">
                {[1, 2].map((index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3 flex-1">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className={`h-4 ${isMobile ? 'w-32' : 'w-48'}`} />
                        <Skeleton className={`h-3 ${isMobile ? 'w-24' : 'w-32'}`} />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}