
import { useState, useEffect } from "react";
import { Recipe, MealPlan } from "@/types";
import { GripVertical } from "lucide-react";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { MealCardContent } from "./MealCardContent";
import { MealCardDetails } from "./MealCardDetails";
import { MealCardActions } from "./MealCardActions";

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
    }
  };

  const handleCreateLeftover = () => {
    if (recipe && onCreateLeftover) {
      onCreateLeftover(mealPlan, recipe);
    }
  };

  const recipeImage = parentRecipe?.image || recipe?.image || "/images/placeholder.png";
  const recipeTitle = parentRecipe?.title || recipe?.title || "Unknown Recipe";

  return (
    <div
      className={`relative bg-white rounded-lg border shadow-sm transition-all duration-300 ease-out hover:shadow-md group ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${isRemoving ? 'animate-out slide-out-to-right-full duration-300' : ''} ${
        mealPlan.is_completed ? 'opacity-60 bg-gray-50' : ''
      }`}
      style={{ 
        transitionDelay: `${animationDelay}ms`,
        willChange: 'transform, opacity'
      }}
    >
      <div className="flex items-start justify-between p-3">
        <div className="flex-1 flex items-start gap-3">
          <MealCardContent
            recipeImage={recipeImage}
            recipeTitle={recipeTitle}
            isCompleted={mealPlan.is_completed}
            parentRecipe={parentRecipe}
            recipe={recipe}
          />
          <MealCardDetails
            mealPlan={mealPlan}
            recipe={recipe}
            parentRecipe={parentRecipe}
            onServingsChange={handleServingsChange}
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <MealCardActions
            mealPlan={mealPlan}
            recipe={recipe}
            onComplete={handleComplete}
            onCreateLeftover={onCreateLeftover ? handleCreateLeftover : undefined}
            onRemove={handleRemove}
          />

          {/* Drag Handle */}
          {dragHandleProps && (
            <div {...dragHandleProps} className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-gray-400 transition-all duration-200 hover:scale-110 active:scale-95" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
