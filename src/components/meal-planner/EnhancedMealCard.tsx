
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
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
  dragHandleProps?: any; // Props from react-beautiful-dnd
}

export function EnhancedMealCard({ 
  mealPlan, 
  recipe, 
  onRemove, 
  onCreateLeftover,
  parentRecipe,
  dragHandleProps
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
            <div className={`flex items-center gap-${isMobile ? '0.5' : '1'} flex-shrink-0`}>
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
                onClick={() => onRemove(mealPlan.id)}
                className={`text-red-500 hover:text-red-700 hover:bg-red-50 ${isMobile ? 'h-8 w-8' : ''}`}
              >
                <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </Button>
              
              <div
                {...dragHandleProps}
                className={`flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing ${
                  isMobile ? 'p-1' : 'p-1.5'
                }`}
              >
                <GripVertical className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const showLeftoverButton = mealPlan.meal_type === 'dinner' && !mealPlan.is_leftover && onCreateLeftover;

  return (
    <Card className={`mb-${isMobile ? '1.5' : '2'} ${mealPlan.is_leftover ? 'bg-orange-50 border-orange-200' : ''}`}>
      <CardContent className={`${isMobile ? 'p-2.5' : 'p-3'}`}>
        <div className={`flex items-center gap-${isMobile ? '2' : '3'}`}>
          {/* Recipe thumbnail - Made larger */}
          <div className={`${isMobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-md overflow-hidden bg-muted flex-shrink-0`}>
            <RecipeImage recipe={displayRecipe} className="w-full h-full" iconSize={isMobile ? "h-4 w-4" : "h-5 w-5"} />
          </div>

          <div className="flex-1 min-w-0">
            {mealPlan.is_leftover ? (
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
                  {mealPlan.leftover_servings} servings from dinner
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
                    {displayRecipe.prep_time + displayRecipe.cook_time} min
                  </span>
                  <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                    • {mealPlan.original_servings || displayRecipe.servings} servings
                  </span>
                  {mealPlan.original_servings && mealPlan.original_servings !== displayRecipe.servings && (
                    <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-orange-600`}>
                      (some saved for leftovers)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-${isMobile ? '2' : '3'} flex-shrink-0`}>
            {showLeftoverButton && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
                onClick={() => onCreateLeftover(mealPlan, displayRecipe)}
                className={`text-orange-600 hover:text-orange-700 hover:bg-orange-50 ${isMobile ? 'h-8 px-2' : 'px-2'}`}
                title="Create lunch leftovers"
              >
                <span className={`${isMobile ? 'text-xs' : 'text-xs'}`}>+ Lunch</span>
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

            <div
              {...dragHandleProps}
              className={`flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing ${
                isMobile ? 'p-1' : 'p-1.5'
              }`}
            >
              <GripVertical className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
