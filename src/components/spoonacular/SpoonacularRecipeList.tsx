
import { SpoonacularRecipeCard } from "./SpoonacularRecipeCard";
import { SpoonacularRecipe } from "@/hooks/useSpoonacularApi";
import { Skeleton } from "@/components/ui/skeleton";

interface SpoonacularRecipeListProps {
  recipes: SpoonacularRecipe[];
  isLoading: boolean;
  maxItems?: number;
}

export const SpoonacularRecipeList = ({ recipes, isLoading, maxItems }: SpoonacularRecipeListProps) => {
  const displayRecipes = maxItems ? recipes.slice(0, maxItems) : recipes;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (displayRecipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">No recipes found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {displayRecipes.map((recipe) => (
        <SpoonacularRecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};
