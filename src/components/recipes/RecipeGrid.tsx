
import { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecipeGridProps {
  recipes: Recipe[];
  mobileLayout: string;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onRecipeClick?: (recipeId: string) => void;
}

export function RecipeGrid({ recipes, mobileLayout, onAddToMealPlan, onRecipeClick }: RecipeGridProps) {
  const isMobile = useIsMobile();

  // Determine grid classes based on mobile layout or default responsive layout
  const getGridClasses = () => {
    if (isMobile) {
      // Mobile with layout preference
      return mobileLayout === '1' 
        ? 'grid grid-cols-1 gap-4 sm:gap-6'
        : 'grid grid-cols-2 gap-3 sm:gap-4';
    }
    // Default responsive layout for desktop
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';
  };

  return (
    <div className={getGridClasses()} data-testid="recipe-list">
      {recipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          onAddToMealPlan={onAddToMealPlan ? () => onAddToMealPlan(recipe) : undefined}
          onRecipeClick={onRecipeClick ? () => onRecipeClick(recipe.id) : undefined}
          showActions={true}
          mobileLayout={mobileLayout}
        />
      ))}
    </div>
  );
}
