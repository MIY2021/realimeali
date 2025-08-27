import { DiscoverRecipeFilters } from "@/types/edamam";
import { useEdamamApiPagination } from "@/hooks/useEdamamApiPagination";
import { ExternalRecipeCard } from "./ExternalRecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DiscoverRecipesResultsProps {
  filters: DiscoverRecipeFilters;
  mobileLayout: string;
}

export function DiscoverRecipesResults({ filters, mobileLayout }: DiscoverRecipesResultsProps) {
  const { recipes, isLoading, isLoadingMore, hasMore, error, totalFetched, loadMore } = useEdamamApiPagination(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || "Something went wrong while fetching recipes. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-6xl">🔍</div>
          <h3 className="text-xl font-semibold text-navy">No recipes found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms. 
            Maybe try a broader search or different cuisine type?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      <div className={`grid gap-4 ${mobileLayout === '2' ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} lg:grid-cols-3 xl:grid-cols-4`}>
        {recipes.map((hit, index) => (
          <ExternalRecipeCard 
            key={`${hit.recipe.uri}-${index}`} 
            recipe={hit.recipe} 
            mobileLayout={mobileLayout}
          />
        ))}
      </div>
      
      {/* Load More Section */}
      {hasMore && recipes.length > 0 && (
        <div className="flex flex-col items-center space-y-4 pt-8">
          <Button 
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="min-w-[140px]"
          >
            {isLoadingMore ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Recipes'
            )}
          </Button>
        </div>
      )}
      
      {!hasMore && recipes.length > 0 && (
        <div className="text-center pt-8">
          <p className="text-muted-foreground">
            That's all the recipes we found! Try adjusting your filters for more results.
          </p>
        </div>
      )}
    </div>
  );
}