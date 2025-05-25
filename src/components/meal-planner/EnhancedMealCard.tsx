
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import { MealPlan, Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe: Recipe | undefined;
  onRemove: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  parentRecipe?: Recipe; // For leftover meals
}

export function EnhancedMealCard({ 
  mealPlan, 
  recipe, 
  onRemove, 
  onCreateLeftover,
  parentRecipe 
}: EnhancedMealCardProps) {
  const displayRecipe = recipe || parentRecipe;
  
  // Create URL-friendly slug from recipe title
  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getRecipeUrl = (recipe: Recipe) => {
    const recipeSlug = createSlug(recipe.title);
    return `/recipes/${recipe.id}/${recipeSlug}`;
  };

  if (!displayRecipe) {
    return (
      <Card className="mb-2">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Unknown recipe</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(mealPlan.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const showLeftoverButton = mealPlan.mealType === 'dinner' && !mealPlan.isLeftover && onCreateLeftover;

  return (
    <Card className={`mb-2 ${mealPlan.isLeftover ? 'bg-orange-50 border-orange-200' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Recipe thumbnail */}
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <RecipeImage recipe={displayRecipe} className="w-full h-full" iconSize="h-4 w-4" />
          </div>

          <div className="flex-1">
            {mealPlan.isLeftover ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-600">🍽️</span>
                  <Link 
                    to={getRecipeUrl(displayRecipe)}
                    className="font-medium text-orange-800 hover:text-orange-900 transition-colors"
                  >
                    Leftover: {displayRecipe.title}
                  </Link>
                </div>
                <div className="text-xs text-orange-600">
                  {mealPlan.leftoverServings} servings from dinner
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Link 
                  to={getRecipeUrl(displayRecipe)}
                  className="text-sm font-medium hover:text-terracotta transition-colors block"
                >
                  {displayRecipe.title}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {displayRecipe.prepTime + displayRecipe.cookTime} min
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {mealPlan.originalServings || displayRecipe.servings} servings
                  </span>
                  {mealPlan.originalServings && mealPlan.originalServings !== displayRecipe.servings && (
                    <span className="text-xs text-orange-600">
                      (some saved for leftovers)
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {mealPlan.notes && (
              <div className="text-xs text-gray-500 mt-1">{mealPlan.notes}</div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {showLeftoverButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateLeftover(mealPlan, displayRecipe)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Create lunch leftovers"
              >
                <UtensilsCrossed className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(mealPlan.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
