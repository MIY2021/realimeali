
import { useState } from "react";
import { MealDBRecipeCard } from "./MealDBRecipeCard";
import { MealDBRecipe } from "@/hooks/useMealDBApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface MealDBRecipeListProps {
  recipes: MealDBRecipe[];
  isLoading: boolean;
  maxItems?: number;
}

export const MealDBRecipeList = ({ recipes, isLoading, maxItems }: MealDBRecipeListProps) => {
  const [showAll, setShowAll] = useState(false);
  
  // Default to showing 12 items initially
  const itemsToShow = maxItems || 12;
  const displayRecipes = showAll ? recipes : recipes.slice(0, itemsToShow);
  const hasMore = recipes.length > itemsToShow && !showAll;

  if (isLoading) {
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
          Showing {displayRecipes.length} of {recipes.length} recipes
        </p>
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayRecipes.map((recipe) => (
          <MealDBRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setShowAll(true)}
            variant="outline"
            className="px-8"
          >
            Load More Recipes ({recipes.length - itemsToShow} remaining)
          </Button>
        </div>
      )}
    </div>
  );
};
