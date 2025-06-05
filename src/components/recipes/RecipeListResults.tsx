
import { Button } from "@/components/ui/button";
import { RecipeGrid } from "./RecipeGrid";
import { Recipe } from "@/types";

interface RecipeListResultsProps {
  filteredAndSortedRecipes: Recipe[];
  visibleRecipes: Recipe[];
  hasMoreRecipes: boolean;
  handleLoadMore: () => void;
  mobileLayout: string;
  onRecipeClick: (recipeId: string) => void;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeListResults({
  filteredAndSortedRecipes,
  visibleRecipes,
  hasMoreRecipes,
  handleLoadMore,
  mobileLayout,
  onRecipeClick,
  onAddToMealPlan,
}: RecipeListResultsProps) {
  if (filteredAndSortedRecipes.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-muted-foreground">No recipes found. Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <>
      <RecipeGrid
        recipes={visibleRecipes}
        mobileLayout={mobileLayout}
        onRecipeClick={onRecipeClick}
        onAddToMealPlan={onAddToMealPlan}
      />
      
      <div className="flex flex-col items-center gap-4 mt-6 px-4">
        {hasMoreRecipes && (
          <Button onClick={handleLoadMore} variant="outline" className="w-full sm:w-auto">
            Load More Recipes
          </Button>
        )}
        <p className="text-sm text-muted-foreground text-center">
          Showing {visibleRecipes.length} of {filteredAndSortedRecipes.length} recipes
        </p>
      </div>
    </>
  );
}
