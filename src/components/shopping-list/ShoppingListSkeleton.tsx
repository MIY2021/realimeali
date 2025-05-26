
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ShoppingListSkeleton() {
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-${isMobile ? '4' : '6'}`}>
      {[1, 2, 3].map((index) => (
        <Card key={index} className="w-full">
          <CardHeader className={`${isMobile ? 'pb-2 px-3 pt-3' : 'pb-3'}`}>
            <Skeleton className={`h-4 w-32 ${isMobile ? 'h-3' : ''}`} />
          </CardHeader>
          <CardContent className={`space-y-${isMobile ? '1.5' : '2'} ${isMobile ? 'pt-0 px-3 pb-3' : 'pt-0'}`}>
            {[1, 2, 3].map((itemIndex) => (
              <div key={itemIndex} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className={`h-4 w-24 ${isMobile ? 'w-20' : ''}`} />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
