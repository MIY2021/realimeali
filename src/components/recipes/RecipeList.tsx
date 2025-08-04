
import { useEffect } from "react";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { RecipeSelectionView } from "./RecipeSelectionView";
import { Recipe } from "@/types";

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, isLoading, onAddToMealPlan }: RecipeListProps) {
  const { savePosition, restorePosition } = useScrollRestoration({
    key: 'recipes',
    waitForContent: true,
    contentSelector: '[data-scroll-content]'
  });

  useEffect(() => {
    // Check if we should restore scroll position (coming back from recipe detail)
    const shouldRestore = sessionStorage.getItem('restoreRecipesScroll') === 'true';
    
    if (shouldRestore && !isLoading) {
      restorePosition().then(success => {
        if (success) {
          sessionStorage.removeItem('restoreRecipesScroll');
        }
      });
    }
  }, [isLoading, restorePosition]);

  const handleRecipeClick = (recipe: Recipe) => {
    console.log('Recipe clicked, saving scroll position');
    
    // Save current position before navigation
    savePosition();
    
    // Mark that we should restore when returning
    sessionStorage.setItem('restoreRecipesScroll', 'true');
  };

  return (
    <div data-scroll-content>
      <RecipeSelectionView
        recipes={recipes}
        isLoading={isLoading}
        onSelectRecipe={handleRecipeClick}
        onAddToMealPlan={onAddToMealPlan}
      />
    </div>
  );
}
