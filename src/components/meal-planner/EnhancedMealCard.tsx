import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { MealPlan, Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useIsMobile } from "@/hooks/use-mobile";
import { DeleteMealDialog } from "@/components/meal-planner/DeleteMealDialog";
import { createRecipeUrl } from "@/utils/slugUtils";
import { ServingsSelector } from "@/components/meal-planner/ServingsSelector";

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe: Recipe | undefined;
  onRemove: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  onUpdateServings?: (mealPlanId: string, newServings: number) => Promise<void>;
  parentRecipe?: Recipe; // For leftover meals
  dragHandleProps?: any; // Props from react-beautiful-dnd
  animationDelay?: number; // For staggered animations
}

export function EnhancedMealCard({ 
  mealPlan, 
  recipe, 
  onRemove, 
  onCreateLeftover,
  onUpdateServings,
  parentRecipe,
  dragHandleProps,
  animationDelay = 0
}: EnhancedMealCardProps) {
  const isMobile = useIsMobile();
  const displayRecipe = recipe || parentRecipe;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);
    
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const getRecipeUrl = (recipe: Recipe) => {
    return createRecipeUrl(recipe);
  };

  const handleDeleteConfirm = () => {
    onRemove(mealPlan.id);
  };

  // Calculate effective servings for dinner meals with leftovers
  const getEffectiveServings = () => {
    if (!displayRecipe) return null;
    
    if (mealPlan.is_leftover) {
      return mealPlan.leftover_servings;
    }
    
    // Use planned_servings if available, otherwise fall back to original_servings or recipe servings
    const plannedServings = mealPlan.planned_servings || mealPlan.original_servings || displayRecipe.servings;
    
    // For dinner meals, show reduced servings if leftovers were allocated
    if (mealPlan.meal_type === 'dinner' && mealPlan.leftover_servings && mealPlan.leftover_servings > 0) {
      const effectiveServings = plannedServings - mealPlan.leftover_servings;
      console.log("🍽️ Calculating effective servings for dinner:", {
        plannedServings,
        leftoverServings: mealPlan.leftover_servings,
        effectiveServings,
        mealPlanId: mealPlan.id
      });
      return effectiveServings;
    }
    
    return plannedServings;
  };

  const hasLeftoversAllocated = mealPlan.meal_type === 'dinner' && mealPlan.leftover_servings && mealPlan.leftover_servings > 0;

  if (!displayRecipe) {
    return (
      <Card className={`mb-${isMobile ? '1.5' : '2'} transform transition-all duration-500 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-4 opacity-0 scale-95'
      }`}
      style={{ transitionDelay: `${animationDelay}ms` }}>
        <CardContent className={`${isMobile ? 'p-2.5' : 'p-3'}`}>
          <div className="flex items-center justify-between">
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>Unknown recipe</span>
            <div className={`flex items-center gap-${isMobile ? '0.5' : '1'} flex-shrink-0`}>
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
                onClick={() => setShowDeleteDialog(true)}
                className={`text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-105 ${isMobile ? 'h-8 w-8' : ''}`}
              >
                <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </Button>
              
              <div
                {...dragHandleProps}
                className={`flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 ${
                  isMobile ? 'p-1' : 'p-1.5'
                }`}
              >
                <GripVertical className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </div>
            </div>
          </div>
          
          <DeleteMealDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDeleteConfirm}
            recipe={displayRecipe}
          />
        </CardContent>
      </Card>
    );
  }

  const showLeftoverButton = mealPlan.meal_type === 'dinner' && !mealPlan.is_leftover && onCreateLeftover;
  const effectiveServings = getEffectiveServings();
  const plannedServings = mealPlan.planned_servings || mealPlan.original_servings || displayRecipe?.servings || 1;

  const handleServingsUpdate = async (newServings: number) => {
    if (onUpdateServings) {
      await onUpdateServings(mealPlan.id, newServings);
    }
  };

  return (
    <Card className={`mb-${isMobile ? '1.5' : '2'} transform transition-all duration-500 ease-out hover:shadow-md ${
      isVisible 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-4 opacity-0 scale-95'
    }`}
    style={{ 
      transitionDelay: `${animationDelay}ms`,
      willChange: 'transform, opacity'
    }}>
      <CardContent className={`${isMobile ? 'p-2.5' : 'p-3'}`}>
        <div className={`flex items-center gap-${isMobile ? '2' : '3'}`}>
          {/* Recipe thumbnail - Made larger with hover effect */}
          <div className={`${isMobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-md overflow-hidden bg-muted flex-shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-sm`}>
            <RecipeImage recipe={displayRecipe} className="w-full h-full" iconSize={isMobile ? "h-4 w-4" : "h-5 w-5"} />
          </div>

          <div className="flex-1 min-w-0">
            {mealPlan.is_leftover ? (
              <div className={`space-y-${isMobile ? '0.5' : '1'}`}>
                <div className={`flex items-center gap-${isMobile ? '1.5' : '2'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <span className="text-green-600 animate-pulse">🍽️</span>
                  <Link 
                    to={getRecipeUrl(displayRecipe)}
                    className="font-medium text-green-800 hover:text-green-900 transition-all duration-200 truncate hover:scale-105 origin-left"
                  >
                    Leftover: {displayRecipe.title}
                  </Link>
                </div>
                <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-green-600`}>
                  {effectiveServings} servings from dinner
                </div>
              </div>
            ) : (
              <div className={`space-y-${isMobile ? '0.5' : '1'}`}>
                <Link 
                  to={getRecipeUrl(displayRecipe)}
                  className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium hover:text-terracotta transition-all duration-200 block truncate hover:scale-105 origin-left`}
                >
                  {displayRecipe.title}
                </Link>
                <div className={`flex items-center gap-${isMobile ? '1.5' : '2'} flex-wrap`}>
                  <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                    {displayRecipe.prep_time + displayRecipe.cook_time} min
                  </span>
                  <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                    • {effectiveServings} servings
                  </span>
                  {hasLeftoversAllocated && (
                    <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-green-600 animate-pulse`}>
                      (+{mealPlan.leftover_servings} saved for leftovers)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-${isMobile ? '1' : '2'} flex-shrink-0`}>
            {/* Servings Selector - only show for non-leftover meals */}
            {!mealPlan.is_leftover && onUpdateServings && (
              <div className="flex flex-col items-center gap-1">
                <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                  servings
                </span>
                <ServingsSelector
                  currentServings={plannedServings}
                  onServingsChange={handleServingsUpdate}
                  size="sm"
                />
              </div>
            )}

            {showLeftoverButton && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
                onClick={() => onCreateLeftover(mealPlan, displayRecipe)}
                className={`text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 hover:scale-105 ${isMobile ? 'h-8 px-2' : 'px-2'}`}
                title="Create lunch leftovers"
              >
                <span className={`${isMobile ? 'text-xs' : 'text-xs'}`}>+ Lunch</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "sm"}
              onClick={() => setShowDeleteDialog(true)}
              className={`text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-105 ${isMobile ? 'h-8 w-8' : ''}`}
            >
              <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>

            <div
              {...dragHandleProps}
              className={`flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 active:scale-95 active:rotate-2 ${
                isMobile ? 'p-1' : 'p-1.5'
              }`}
              style={{ willChange: 'transform' }}
            >
              <GripVertical className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </div>
          </div>
        </div>
        
        <DeleteMealDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
          recipe={displayRecipe}
        />
      </CardContent>
    </Card>
  );
}
