
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight } from "lucide-react";
import { MealPlan, Recipe } from "@/types";

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe: Recipe | undefined;
  onRemove: (planId: string) => void;
  parentRecipe?: Recipe; // For leftover meals
}

export function EnhancedMealCard({ 
  mealPlan, 
  recipe, 
  onRemove, 
  parentRecipe 
}: EnhancedMealCardProps) {
  const displayRecipe = recipe || parentRecipe;
  
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

  return (
    <Card className={`mb-2 ${mealPlan.isLeftover ? 'bg-orange-50 border-orange-200' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {mealPlan.isLeftover ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-600">🍽️</span>
                  <span className="font-medium text-orange-800">
                    Leftover: {displayRecipe.title}
                  </span>
                </div>
                <div className="text-xs text-orange-600 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  {mealPlan.leftoverServings} servings from dinner
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-medium text-sm">{displayRecipe.title}</div>
                <div className="text-xs text-gray-600">
                  {mealPlan.originalServings || displayRecipe.servings} servings
                  {mealPlan.originalServings && mealPlan.originalServings !== displayRecipe.servings && (
                    <span className="text-orange-600 ml-1">
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(mealPlan.id)}
            className="ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
