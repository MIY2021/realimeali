
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Recipe, MealPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, GripVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ServingsSelector } from "./ServingsSelector";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { generateSlug } from "@/utils/slugUtils";

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe: Recipe | undefined;
  onRemove: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  parentRecipe?: Recipe | undefined;
  dragHandleProps?: any;
  animationDelay?: number;
}

export const EnhancedMealCard = ({
  mealPlan,
  recipe,
  onRemove,
  onCreateLeftover,
  parentRecipe,
  dragHandleProps,
  animationDelay = 0,
}: EnhancedMealCardProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { updateMealPlanServings, updateMealPlanCompletion } = useMealPlan();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(mealPlan.id);
    }, 300);
  };

  const handleComplete = async () => {
    try {
      await updateMealPlanCompletion(mealPlan.id, !mealPlan.is_completed);
    } catch (error) {
      console.error('Error updating completion status:', error);
    }
  };

  const handleServingsChange = async (newServings: number) => {
    try {
      await updateMealPlanServings(mealPlan.id, newServings);
    } catch (error) {
      console.error('Error updating servings:', error);
      // The error is already handled in the context
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const recipeToUse = parentRecipe || recipe;
    if (recipeToUse) {
      const slug = generateSlug(recipeToUse.title);
      navigate(`/my-recipes/${slug}`);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const recipeToUse = parentRecipe || recipe;
    if (recipeToUse) {
      const slug = generateSlug(recipeToUse.title);
      navigate(`/my-recipes/${slug}`);
    }
  };

  const handleCreateLeftover = () => {
    if (recipe && onCreateLeftover) {
      onCreateLeftover(mealPlan, recipe);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent any unwanted navigation when clicking the card itself
    e.preventDefault();
    e.stopPropagation();
  };

  const recipeImage = parentRecipe?.image || recipe?.image || "/images/placeholder.png";
  const recipeTitle = parentRecipe?.title || recipe?.title || "Unknown Recipe";

  return (
    <div
      className={`relative bg-white rounded-lg border shadow-sm transition-all duration-300 ease-out hover:shadow-md group select-none ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${isRemoving ? 'animate-out slide-out-to-right-full duration-300' : ''} ${
        mealPlan.is_completed ? 'opacity-60 bg-gray-50' : ''
      }`}
      style={{ 
        transitionDelay: `${animationDelay}ms`,
        willChange: 'transform, opacity'
      }}
      onClick={handleCardClick}
    >
      {/* Recipe Content */}
      <div className="flex items-start justify-between p-3">
        <div className="flex-1 flex items-start gap-3">
          {/* Larger thumbnail */}
          <img
            src={recipeImage}
            alt={recipeTitle}
            className="h-20 w-20 rounded-lg object-cover object-center aspect-square flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleImageClick}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <h4 
              className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} line-clamp-1 text-navy cursor-pointer hover:text-terracotta transition-colors mb-1 ${
                mealPlan.is_completed ? 'line-through' : ''
              }`}
              onClick={handleTitleClick}
            >
              {recipeTitle}
            </h4>
            
            {/* Servings selector */}
            <div className={`flex items-center gap-2 mb-2 ${mealPlan.is_completed ? 'opacity-60' : ''}`}>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                Servings:
              </span>
              <ServingsSelector
                currentServings={mealPlan.planned_servings || recipe?.servings || 1}
                onServingsChange={handleServingsChange}
              />
            </div>
            
            {/* Action buttons underneath servings */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* Meal Made button */}
              <Button
                size="sm"
                variant={mealPlan.is_completed ? "default" : "outline"}
                onClick={handleComplete}
                className={`${isMobile ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-sm'} ${
                  mealPlan.is_completed 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'text-green-600 border-green-600 hover:bg-green-50'
                }`}
              >
                <Check className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1'}`} />
                Made
              </Button>

              {/* Add Leftover button (only for non-leftovers) */}
              {!mealPlan.is_leftover && recipe && onCreateLeftover && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateLeftover}
                  className={`${isMobile ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-sm'} text-blue-600 border-blue-600 hover:bg-blue-50`}
                >
                  <Plus className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1'}`} />
                  Lunch
                </Button>
              )}

              {/* Remove button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemove}
                className={`${isMobile ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-sm'} text-red-500 border-red-500 hover:bg-red-50`}
              >
                <X className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1'}`} />
                Remove
              </Button>
            </div>
            
            {mealPlan.is_leftover && (
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} mt-1 ${
                mealPlan.is_completed ? 'opacity-60 line-through' : ''
              }`}>
                Leftover from {parentRecipe?.title || 'original meal'}
              </p>
            )}
          </div>
        </div>

        {/* Drag Handle - moved to the rightmost position */}
        {dragHandleProps && (
          <div 
            {...dragHandleProps} 
            className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-opacity touch-none ml-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <GripVertical className="h-4 w-4 text-gray-400 transition-all duration-200 hover:scale-110 active:scale-95" />
          </div>
        )}
      </div>
    </div>
  );
};
