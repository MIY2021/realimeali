
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ShoppingListSkeleton() {
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-${isMobile ? '2' : '3'}`}>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <Card key={index} className="w-full">
          <CardContent className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center space-x-3 flex-1">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className={`h-4 w-32 ${isMobile ? 'w-24' : ''}`} />
                <Skeleton className={`h-3 w-48 ${isMobile ? 'w-32' : ''}`} />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
