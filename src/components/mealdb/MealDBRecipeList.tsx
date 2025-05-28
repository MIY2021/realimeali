
import { MealDBRecipeCard } from "./MealDBRecipeCard";
import { MealDBRecipe } from "@/hooks/useMealDBApi";
import { Skeleton } from "@/components/ui/skeleton";

interface MealDBRecipeListProps {
  recipes: MealDBRecipe[];
  isLoading: boolean;
  maxItems?: number;
}

export const MealDBRecipeList = ({ recipes, isLoading, maxItems }: MealDBRecipeListProps) => {
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
        <MealDBRecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};
