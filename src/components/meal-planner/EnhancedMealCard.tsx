
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Recipe, MealPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Plus, X } from "lucide-react";
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
  const { updateMealPlanServings } = useMealPlan();

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

  const recipeImage = parentRecipe?.image || recipe?.image || "/images/placeholder.png";
  const recipeTitle = parentRecipe?.title || recipe?.title || "Unknown Recipe";

  return (
    <div
      className={`relative bg-white rounded-lg border shadow-sm transition-all duration-500 ease-out hover:shadow-md group ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${isRemoving ? 'animate-out slide-out-to-right-full duration-300' : ''}`}
      style={{ 
        transitionDelay: `${animationDelay}ms`,
        willChange: 'transform, opacity'
      }}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div {...dragHandleProps} className="absolute top-2 left-2 cursor-grab active:cursor-grabbing z-10">
          {/* <GripVertical className="h-4 w-4 text-gray-400 transition-all duration-200 hover:scale-110 active:scale-95" /> */}
        </div>
      )}

      {/* Recipe Content */}
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          <img
            src={recipeImage}
            alt={recipeTitle}
            className="h-16 w-16 rounded-lg object-cover object-center aspect-square ml-2 mt-2"
          />
          <div className="flex flex-col">
            <h4 
              className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} line-clamp-1 text-navy cursor-pointer hover:text-terracotta transition-colors`}
              onClick={handleTitleClick}
            >
              {recipeTitle}
            </h4>
            {mealPlan.is_leftover && (
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Leftover from {parentRecipe?.title || 'original meal'}
              </p>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-accent mr-2 mt-2">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit Recipe</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500 hover:bg-red-50">
              <X className="mr-2 h-4 w-4" />
              <span>Delete Meal</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions Section */}
      <div className={`flex items-center justify-between ${isMobile ? 'px-3 pb-2' : 'px-4 pb-3'}`}>
        <div className="flex items-center gap-2">
          {/* Servings Selector */}
          <div className="flex items-center gap-2">
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              Servings:
            </span>
            <ServingsSelector
              currentServings={mealPlan.planned_servings || recipe?.servings || 1}
              onServingsChange={handleServingsChange}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Leftover Button */}
          {!mealPlan.is_leftover && recipe && onCreateLeftover && (
            <Button
              size={isMobile ? "sm" : "sm"}
              variant="outline"
              onClick={() => onCreateLeftover(mealPlan, recipe)}
              className={`text-green-600 border-green-200 hover:bg-green-50 transition-all duration-200 hover:scale-105 ${isMobile ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-sm'}`}
            >
              <Plus className={`${isMobile ? 'h-3 w-3 mr-0.5' : 'h-4 w-4 mr-1'}`} />
              Lunch
            </Button>
          )}

          {/* Remove Button */}
          <Button
            size={isMobile ? "sm" : "sm"}
            variant="ghost"
            onClick={handleRemove}
            className={`text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-105 ${isMobile ? 'h-7 w-7 p-0' : 'h-8 w-8 p-0'}`}
          >
            <X className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>

      {/* Bottom Drag Handle */}
      {dragHandleProps && (
        <div {...dragHandleProps} className="absolute bottom-1 right-1 cursor-grab active:cursor-grabbing">
          {/* <GripVertical className="h-4 w-4 text-gray-400 transition-all duration-200 hover:scale-110 active:scale-95" /> */}
        </div>
      )}
    </div>
  );
};
