
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Recipe, MealPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Plus, Check, X, GripVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handleTitleClick = () => {
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
      {/* Recipe Content */}
      <div className="flex items-start justify-between p-3">
        <div className="flex-1 flex items-start gap-3">
          {/* Drag Handle */}
          {dragHandleProps && (
            <div {...dragHandleProps} className="flex-shrink-0 cursor-grab active:cursor-grabbing mt-2 opacity-60 hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-gray-400 transition-all duration-200 hover:scale-110 active:scale-95" />
            </div>
          )}

          <img
            src={recipeImage}
            alt={recipeTitle}
            className="h-16 w-16 rounded-lg object-cover object-center aspect-square flex-shrink-0"
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
            
            {/* Servings moved directly under title */}
            <div className={`flex items-center gap-2 mb-1 ${mealPlan.is_completed ? 'opacity-60' : ''}`}>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                Servings:
              </span>
              <ServingsSelector
                currentServings={mealPlan.planned_servings || recipe?.servings || 1}
                onServingsChange={handleServingsChange}
              />
            </div>
            
            {mealPlan.is_leftover && (
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} ${
                mealPlan.is_completed ? 'opacity-60 line-through' : ''
              }`}>
                Leftover from {parentRecipe?.title || 'original meal'}
              </p>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Complete Button */}
          <Button
            size={isMobile ? "sm" : "sm"}
            variant="ghost"
            onClick={handleComplete}
            className={`transition-all duration-200 hover:scale-105 ${
              mealPlan.is_completed 
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            } ${isMobile ? 'h-7 w-7 p-0' : 'h-8 w-8 p-0'}`}
          >
            <Check className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-accent flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] bg-white border shadow-lg">
              {!mealPlan.is_leftover && recipe && onCreateLeftover && (
                <>
                  <DropdownMenuItem onClick={handleCreateLeftover} className="text-green-600 focus:text-green-600 hover:bg-green-50">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add Leftover Lunch</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit Recipe</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500 hover:bg-red-50" onClick={handleRemove}>
                <X className="mr-2 h-4 w-4" />
                <span>Remove from plan</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
