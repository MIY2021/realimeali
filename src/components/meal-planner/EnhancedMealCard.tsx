
import { useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MealPlan, Recipe, MealType } from "@/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe?: Recipe;
  parentRecipe?: Recipe;
  onRemove: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe: Recipe) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  animationDelay?: number;
}

export function EnhancedMealCard({
  mealPlan,
  recipe,
  parentRecipe,
  onRemove,
  onCreateLeftover,
  dragHandleProps,
  animationDelay = 0,
}: EnhancedMealCardProps) {
  const [servings, setServings] = useState(mealPlan.planned_servings || recipe?.servings || 1);

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

  const isLeftover = mealPlan.is_leftover;
  const isLunchLeftover = isLeftover && mealPlan.meal_type === 'lunch';

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img 
              src={recipe.image_url || "/placeholder.svg"} 
              alt={recipe.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div>
              <h4 className="font-medium text-gray-900">
                {recipe.title}
              </h4>
              {isLunchLeftover && parentRecipe && (
                <p className="text-xs text-gray-500">
                  From {parentRecipe.title}
                </p>
              )}
            </div>
          </div>
          {isLeftover && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-gray-100 text-gray-600 border-gray-200"
            >
              Leftover
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Servings:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium w-4 text-center">{servings}</span>
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
          </div>

          <div className="flex items-center gap-2">
            {!isLeftover && mealPlan.meal_type === 'dinner' && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                onClick={handleCreateLeftover}
              >
                + Lunch
              </Button>
            )}
            <Button
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onRemove(mealPlan.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
