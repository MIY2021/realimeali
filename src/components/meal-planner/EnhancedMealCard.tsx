import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Clock, Users, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";
import { Recipe, MealPlan } from "@/types";
import { useNavigate } from "react-router-dom";

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe?: Recipe;
  onRemove?: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  index: number;
}

export const EnhancedMealCard = ({ 
  mealPlan, 
  recipe, 
  onRemove, 
  onCreateLeftover, 
  onReorder,
  index
}: EnhancedMealCardProps) => {
  const navigate = useNavigate();

  const handleRecipeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (recipe?.slug) {
      navigate(`/my-recipes/${recipe.slug}`);
    }
  };

  return (
    <Draggable draggableId={mealPlan.id} index={index}>
      {(provided, snapshot) => (
        <Card 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group transition-all duration-200 hover:shadow-md border-l-4 ${
            mealPlan.is_leftover 
              ? 'border-l-orange-400 bg-orange-50/30' 
              : 'border-l-blue-400 bg-blue-50/30'
          } ${snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : ''}`}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              {/* Drag handle */}
              <div 
                {...provided.dragHandleProps}
                className="mt-1 cursor-grab active:cursor-grabbing touch-none"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>

              {/* Recipe content */}
              <div className="flex-1 min-w-0">
                {recipe ? (
                  <>
                    <button
                      onClick={handleRecipeClick}
                      className="text-left w-full hover:text-blue-600 transition-colors"
                    >
                      <h4 className="font-medium text-sm leading-tight truncate">
                        {recipe.title}
                      </h4>
                    </button>
                    
                    {/* Rest of existing content - servings info, timing, etc. */}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{mealPlan.planned_servings || mealPlan.original_servings}</span>
                      </div>
                      {(recipe.prep_time > 0 || recipe.cook_time > 0) && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{recipe.prep_time + recipe.cook_time}min</span>
                        </div>
                      )}
                      {mealPlan.is_leftover && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700">
                          Leftover
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Recipe not found
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {recipe && !mealPlan.is_leftover && (
                    <DropdownMenuItem 
                      onClick={() => onCreateLeftover?.(mealPlan, recipe)}
                      className="text-sm"
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Create Leftover
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onRemove?.(mealPlan.id)}
                    className="text-red-600 text-sm"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};
