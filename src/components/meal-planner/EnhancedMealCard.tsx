
import { useState } from "react";
import { Trash2, Plus, Minus, GripVertical, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MealPlan, Recipe, MealType } from "@/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useMealPlan } from "@/contexts/MealPlanContext";

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe?: Recipe;
  parentRecipe?: Recipe;
  onRemove: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe: Recipe) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  animationDelay?: number;
  allMealPlans?: MealPlan[];
}

export function EnhancedMealCard({
  mealPlan,
  recipe,
  parentRecipe,
  onRemove,
  onCreateLeftover,
  dragHandleProps,
  animationDelay = 0,
  allMealPlans = [],
}: EnhancedMealCardProps) {
  const [servings, setServings] = useState(mealPlan.planned_servings || recipe?.servings || 1);
  const { updateMealPlanCompletion } = useMealPlan();

  if (!recipe) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-3">
          <p className="text-sm text-muted-foreground">Recipe not found</p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateLeftover = () => {
    onCreateLeftover(mealPlan, recipe);
  };

  const handleCompletionChange = async (completed: boolean) => {
    try {
      await updateMealPlanCompletion(mealPlan.id, completed);
    } catch (error) {
      console.error('Error updating meal completion:', error);
    }
  };

  const isLeftover = mealPlan.is_leftover;
  const isLunchLeftover = isLeftover && mealPlan.meal_type === 'lunch';
  
  // Check if this dinner meal already has leftovers created
  const existingLeftover = allMealPlans.find(plan => 
    plan.parent_meal_plan_id === mealPlan.id && 
    plan.is_leftover && 
    plan.meal_type === 'lunch'
  );
  const leftoverServings = existingLeftover?.planned_servings || existingLeftover?.leftover_servings;

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="flex h-24">
          {/* Recipe Image - Slightly smaller with padding */}
          <div className="w-20 h-20 flex-shrink-0 m-2">
            <img 
              src={recipe.image || "/placeholder.svg"} 
              alt={recipe.title}
              className="w-full h-full object-cover rounded"
            />
          </div>

          {/* Content Area - Reduced left padding to minimize white space */}
          <div className="flex-1 pl-2 pr-4 py-4 flex flex-col justify-between min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm leading-tight truncate ${
                  mealPlan.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {recipe.title}
                </h4>
                {isLunchLeftover && parentRecipe && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leftover from dinner
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isLeftover && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-gray-100 text-gray-600 border-gray-200"
                  >
                    Leftover
                  </Badge>
                )}
                {/* Drag Handle - Moved to right side */}
                <div {...dragHandleProps} className="touch-none cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Servings:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">{servings}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => setServings(servings + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Completion Checkbox */}
                <Checkbox
                  checked={mealPlan.is_completed || false}
                  onCheckedChange={handleCompletionChange}
                  className="h-4 w-4"
                />
                
                {/* Lunch Button - Icon only */}
                {!isLeftover && mealPlan.meal_type === 'dinner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 w-7 p-0 ${
                      existingLeftover 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
                        : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                    }`}
                    onClick={handleCreateLeftover}
                    disabled={!!existingLeftover}
                    title={existingLeftover 
                      ? `${leftoverServings} servings saved for lunch` 
                      : 'Save leftovers for lunch'
                    }
                  >
                    <UtensilsCrossed className="h-3 w-3" />
                  </Button>
                )}
                
                {/* Trash Button */}
                <Button
                  variant="outline" 
                  size="sm"
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onRemove(mealPlan.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
