
import { useEffect } from "react";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useNavigationState } from "@/hooks/useNavigationState";
import { RecipeSelectionView } from "./RecipeSelectionView";
import { Recipe } from "@/types";

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, isLoading, onAddToMealPlan }: RecipeListProps) {
  const { saveScrollPosition } = useScrollPosition();
  const { navigationState, setNavigationState } = useNavigationState();

  useEffect(() => {
    // Restore scroll position if the flag is set
    if (sessionStorage.getItem('restoreRecipesScroll') === 'true') {
      window.scrollTo({
        top: parseInt(sessionStorage.getItem('scrollPosition') || '0', 10),
        behavior: 'instant'
      });
      sessionStorage.removeItem('restoreRecipesScroll'); // Clear the flag
    }
  }, []);

  const handleRecipeClick = (recipe: Recipe) => {
    console.log('Recipe clicked, saving scroll position');
    
    // Save current scroll position with layout context
    const currentLayout = localStorage.getItem('mobileRecipeLayout') || '1';
    saveScrollPosition('recipes', currentLayout);
    
    // Set navigation state to indicate we should restore scroll when returning
    setNavigationState(prev => ({ ...prev, shouldRestoreScroll: true }));
    
    // Set session storage flag as backup
    sessionStorage.setItem('restoreRecipesScroll', 'true');
    sessionStorage.setItem('navigatedFromRecipes', 'true');
  };

  return (
    <RecipeSelectionView
      recipes={recipes}
      isLoading={isLoading}
      onSelectRecipe={handleRecipeClick}
      onAddToMealPlan={onAddToMealPlan}
    />
  );
}
