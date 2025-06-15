
import { useState, useEffect } from "react";
import { Clock, Users, RotateCcw } from "lucide-react";
import { Recipe } from "@/types";
import { ServingsSelector } from "@/components/meal-planner/ServingsSelector";
import { Button } from "@/components/ui/button";

interface RecipeMetaInfoProps {
  recipe: Recipe;
  onServingsChange?: (newServings: number) => void;
  currentServings?: number;
}

export const RecipeMetaInfo = ({ recipe, onServingsChange, currentServings }: RecipeMetaInfoProps) => {
  const [adjustedServings, setAdjustedServings] = useState(currentServings || recipe.servings);
  const totalTime = recipe.prep_time + recipe.cook_time;
  const isAdjusted = adjustedServings !== recipe.servings;

  // Load saved servings from localStorage on mount
  useEffect(() => {
    const savedServings = localStorage.getItem(`recipe-servings-${recipe.id}`);
    if (savedServings) {
      const servings = parseInt(savedServings, 10);
      if (servings > 0) {
        setAdjustedServings(servings);
        onServingsChange?.(servings);
      }
    }
  }, [recipe.id, onServingsChange]);

  const handleServingsChange = async (newServings: number) => {
    setAdjustedServings(newServings);
    // Save to localStorage
    localStorage.setItem(`recipe-servings-${recipe.id}`, newServings.toString());
    onServingsChange?.(newServings);
  };

  const handleReset = () => {
    setAdjustedServings(recipe.servings);
    localStorage.removeItem(`recipe-servings-${recipe.id}`);
    onServingsChange?.(recipe.servings);
  };

  return (
    <div className="space-y-3 mb-6 px-2">
      {/* Mobile layout - compact single row */}
      <div className="flex sm:hidden items-center justify-between gap-4">
        {/* Time info */}
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-terracotta" />
          <span className="text-navy font-medium">{totalTime} min</span>
        </div>
        
        {/* Compact servings */}
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-terracotta" />
          <ServingsSelector
            currentServings={adjustedServings}
            onServingsChange={handleServingsChange}
            minServings={1}
            maxServings={20}
          />
          {isAdjusted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 ml-1"
              title="Reset to original servings"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex flex-col gap-3">
        {/* Time info */}
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-terracotta" />
          <span className="text-navy font-medium">{totalTime} min total</span>
        </div>
        
        {/* Servings controls with original text inline */}
        <div className="flex items-center gap-2 flex-wrap">
          <Users className="h-5 w-5 text-terracotta" />
          <ServingsSelector
            currentServings={adjustedServings}
            onServingsChange={handleServingsChange}
            minServings={1}
            maxServings={20}
          />
          <span className="text-navy font-medium">servings</span>
          {isAdjusted && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
                title="Reset to original servings"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <span className="text-xs text-gray-500 ml-2">
                (Original: {recipe.servings} servings)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
