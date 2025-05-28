
import { MealDBRecipeCard } from "./MealDBRecipeCard";
import { MealDBRecipe } from "@/hooks/useMealDBApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface MealDBRecipeListProps {
  recipes: MealDBRecipe[];
  isLoading: boolean;
  totalCount?: number;
  hasMore?: boolean;
  estimatedTotal?: number;
  onLoadMore?: () => void;
  maxItems?: number;
}

export const MealDBRecipeList = ({ 
  recipes, 
  isLoading, 
  totalCount = 0,
  hasMore = false,
  estimatedTotal,
  onLoadMore,
  maxItems 
}: MealDBRecipeListProps) => {
  
  // For backward compatibility when maxItems is provided (used in other places)
  const shouldShowPagination = maxItems ? false : true;
  const displayRecipes = maxItems ? recipes.slice(0, maxItems) : recipes;
  const showLoadMore = shouldShowPagination && hasMore && !isLoading && onLoadMore;

  // Determine what count to show
  const getCountDisplay = () => {
    if (estimatedTotal) {
      return `Showing ${recipes.length} of ~${estimatedTotal}+ recipes`;
    } else if (totalCount > 0) {
      return `Showing ${recipes.length} of ${totalCount} recipes`;
    } else {
      return `${recipes.length} recipes found`;
    }
  };

  if (isLoading && recipes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">No recipes found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recipe count display */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {getCountDisplay()}
        </p>
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayRecipes.map((recipe) => (
          <MealDBRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {/* Load more section */}
      {showLoadMore && (
        <div className="flex flex-col items-center gap-4 pt-4">
          <Button
            onClick={onLoadMore}
            variant="outline"
            className="px-8"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More Recipes"}
          </Button>
        </div>
      )}

      {/* Loading indicator for load more */}
      {isLoading && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`loading-${i}`} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
