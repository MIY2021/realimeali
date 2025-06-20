
import { useState } from "react";
import { Trash2, Copy, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MealPlan, Recipe } from "@/types";
import { MealServingsDialog } from "./MealServingsDialog";
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
  const [showServingsDialog, setShowServingsDialog] = useState(false);

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
    <>
      <Card className={`transition-colors ${isLeftover ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium truncate">
                  {recipe.title}
                </h4>
                {isLeftover && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      isLunchLeftover 
                        ? 'bg-green-50 text-green-600 border-green-300' 
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                  >
                    Leftover
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {mealPlan.planned_servings || recipe.servings} serving{(mealPlan.planned_servings || recipe.servings) !== 1 ? 's' : ''}
                </span>
                {recipe.prep_time && <span>• {recipe.prep_time}min prep</span>}
                {recipe.cook_time && <span>• {recipe.cook_time}min cook</span>}
              </div>

              {isLeftover && parentRecipe && (
                <p className="text-xs text-green-600 mt-1">
                  From {parentRecipe.title}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setShowServingsDialog(true)}>
                  Adjust Servings
                </DropdownMenuItem>
                {!isLeftover && mealPlan.meal_type === 'dinner' && (
                  <DropdownMenuItem onClick={handleCreateLeftover}>
                    <Copy className="h-3 w-3 mr-2" />
                    Create Leftover
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onRemove(mealPlan.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <MealServingsDialog
        isOpen={showServingsDialog}
        onClose={() => setShowServingsDialog(false)}
        mealType={mealPlan.meal_type}
        onConfirm={(mealType, servings) => {
          // Handle servings update logic here
          console.log('Update servings:', mealType, servings);
        }}
      />
    </>
  );
}
