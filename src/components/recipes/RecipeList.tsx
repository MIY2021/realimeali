
import { useSimpleScrollMemory } from "@/hooks/useSimpleScrollMemory";
import { RecipeSelectionView } from "./RecipeSelectionView";
import { Recipe } from "@/types";

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
  initialNotCookedFilter?: boolean;
  initialFavouritesFilter?: boolean;
}

export function RecipeList({ recipes, isLoading, onAddToMealPlan, initialNotCookedFilter, initialFavouritesFilter }: RecipeListProps) {
  // Use simple scroll memory hook
  useSimpleScrollMemory();

  const handleRecipeClick = (recipe: Recipe) => {
    // No need to save scroll here - RecipeCard handles it
  };

  return (
    <div data-scroll-content>
      <RecipeSelectionView
        recipes={recipes}
        isLoading={isLoading}
        onSelectRecipe={handleRecipeClick}
        onAddToMealPlan={onAddToMealPlan}
        initialNotCookedFilter={initialNotCookedFilter}
        initialFavouritesFilter={initialFavouritesFilter}
      />
    </div>
  );
}
