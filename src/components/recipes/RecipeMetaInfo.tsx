
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
    <div className="space-y-4 mb-6 px-2">
      {/* Time info - always on its own row on mobile */}
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-terracotta" />
        <span className="text-navy font-medium">{totalTime} min total</span>
      </div>
      
      {/* Servings controls - stacked layout for mobile */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-terracotta" />
          <span className="text-navy font-medium">Servings</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
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
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
                title="Reset to original servings"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {isAdjusted && (
            <div className="text-xs text-gray-500">
              (Original: {recipe.servings} servings)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
