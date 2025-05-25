
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import { MealPlan, Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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
    return `/recipes/${recipeSlug}`;
  };

  if (!displayRecipe) {
    return (
      <Card className={`mb-${isMobile ? '1.5' : '2'}`}>
        <CardContent className={`${isMobile ? 'p-2.5' : 'p-3'}`}>
          <div className="flex items-center justify-between">
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>Unknown recipe</span>
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "sm"}
              onClick={() => onRemove(mealPlan.id)}
              className={isMobile ? 'h-8 w-8' : ''}
            >
              <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const showLeftoverButton = mealPlan.mealType === 'dinner' && !mealPlan.isLeftover && onCreateLeftover;

  return (
    <Card className={`mb-${isMobile ? '1.5' : '2'} ${mealPlan.isLeftover ? 'bg-orange-50 border-orange-200' : ''}`}>
      <CardContent className={`${isMobile ? 'p-2.5' : 'p-3'}`}>
        <div className={`flex items-center gap-${isMobile ? '2' : '3'}`}>
          {/* Recipe thumbnail */}
          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-md overflow-hidden bg-muted flex-shrink-0`}>
            <RecipeImage recipe={displayRecipe} className="w-full h-full" iconSize={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </div>

          <div className="flex-1 min-w-0">
            {mealPlan.isLeftover ? (
              <div className={`space-y-${isMobile ? '0.5' : '1'}`}>
                <div className={`flex items-center gap-${isMobile ? '1.5' : '2'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <span className="text-orange-600">🍽️</span>
                  <Link 
                    to={getRecipeUrl(displayRecipe)}
                    className="font-medium text-orange-800 hover:text-orange-900 transition-colors truncate"
                  >
                    Leftover: {displayRecipe.title}
                  </Link>
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-orange-600`}>
                  {mealPlan.leftoverServings} servings from dinner
                </div>
              </div>
            ) : (
              <div className={`space-y-${isMobile ? '0.5' : '1'}`}>
                <Link 
                  to={getRecipeUrl(displayRecipe)}
                  className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium hover:text-terracotta transition-colors block truncate`}
                >
                  {displayRecipe.title}
                </Link>
                <div className={`flex items-center gap-${isMobile ? '1.5' : '2'} flex-wrap`}>
                  <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                    {displayRecipe.prepTime + displayRecipe.cookTime} min
                  </span>
                  <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                    • {mealPlan.originalServings || displayRecipe.servings} servings
                  </span>
                  {mealPlan.originalServings && mealPlan.originalServings !== displayRecipe.servings && (
                    <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-orange-600`}>
                      (some saved for leftovers)
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {mealPlan.notes && (
              <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mt-1 truncate`}>{mealPlan.notes}</div>
            )}
          </div>
          
          <div className={`flex items-center gap-${isMobile ? '0.5' : '1'} flex-shrink-0`}>
            {showLeftoverButton && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
                onClick={() => onCreateLeftover(mealPlan, displayRecipe)}
                className={`text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex items-center gap-1 ${isMobile ? 'h-8 px-1.5' : ''}`}
                title="Create lunch leftovers"
              >
                <UtensilsCrossed className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {!isMobile && <span className="text-xs">Lunch</span>}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "sm"}
              onClick={() => onRemove(mealPlan.id)}
              className={`text-red-500 hover:text-red-700 hover:bg-red-50 ${isMobile ? 'h-8 w-8' : ''}`}
            >
              <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
