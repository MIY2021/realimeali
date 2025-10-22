import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface MealSectionSkeletonProps {
  count?: number;
}

export function MealSectionSkeleton({ count = 3 }: MealSectionSkeletonProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`space-y-${isMobile ? '1.5' : '2'}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="flex items-center justify-between p-3 border rounded-lg bg-card"
          style={{ minHeight: '80px' }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {/* Image skeleton */}
            <Skeleton className="h-16 w-16 rounded flex-shrink-0" style={{ aspectRatio: '1/1' }} />
            
            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <Skeleton className={`h-4 ${isMobile ? 'w-32' : 'w-48'}`} />
              {/* Subtitle skeleton */}
              <Skeleton className={`h-3 ${isMobile ? 'w-20' : 'w-32'}`} />
            </div>
          </div>
          
          {/* Controls skeleton */}
          <div className="flex gap-1 flex-shrink-0">
            <Skeleton className="h-8 w-20 rounded" />  {/* Servings */}
            <Skeleton className="h-8 w-8 rounded" />   {/* Cooked */}
            <Skeleton className="h-8 w-8 rounded" />   {/* Leftover */}
            <Skeleton className="h-8 w-8 rounded" />   {/* Delete */}
          </div>
        </div>
      ))}
    </div>
  );
}
