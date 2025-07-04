
import { MealPlan, Recipe } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Users,
  MoreHorizontal,
  Trash2,
  Plus,
  GripVertical,
  CheckCircle,
  Circle,
  UtensilsCrossed,
  FileText,
} from "lucide-react";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useMealPlan } from "@/contexts/MealPlanContext";

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe?: Recipe;
  onRemove: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  parentRecipe?: Recipe;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  animationDelay?: number;
  allMealPlans?: MealPlan[];
}

export const EnhancedMealCard = ({
  mealPlan,
  recipe,
  onRemove,
  onCreateLeftover,
  parentRecipe,
  dragHandleProps,
  animationDelay = 0,
  allMealPlans = [],
}: EnhancedMealCardProps) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const { updateMealPlanCompletion } = useMealPlan();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);
    
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const handleToggleCompletion = async () => {
    try {
      await updateMealPlanCompletion(mealPlan.id, !mealPlan.is_completed);
    } catch (error) {
      console.error('Error toggling meal completion:', error);
    }
  };

  // Determine display title and details
  const displayTitle = mealPlan.is_freetyped 
    ? mealPlan.meal_name || "Custom Meal"
    : (mealPlan.is_leftover && parentRecipe 
        ? `${parentRecipe.title} (Leftover)` 
        : recipe?.title || "Unknown Recipe");

  const displayIcon = mealPlan.is_freetyped ? (
    <FileText className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-sage`} />
  ) : (
    <UtensilsCrossed className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-terracotta`} />
  );

  const canCreateLeftover = !mealPlan.is_leftover && !mealPlan.is_freetyped && recipe && onCreateLeftover;

  return (
    <Card className={`group hover:shadow-md transition-all duration-300 ease-out transform-gpu ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    } ${mealPlan.is_completed ? 'opacity-75 bg-green-50 border-green-200' : ''}`}
    style={{ 
      transitionDelay: `${animationDelay}ms`,
      willChange: 'transform, opacity'
    }}>
      <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div {...dragHandleProps} className="touch-none mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
              <GripVertical className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400 cursor-grab active:cursor-grabbing`} />
            </div>

            <div className="flex items-start gap-3 flex-1 min-w-0">
              {displayIcon}
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} text-navy truncate`}>
                      {displayTitle}
                    </h3>
                    {mealPlan.is_freetyped && (
                      <Badge variant="secondary" className="text-xs bg-sage/10 text-sage border-sage/20 shrink-0">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>

                {!mealPlan.is_freetyped && recipe && (
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {mealPlan.planned_servings || recipe.servings} servings
                      </span>
                    </div>
                  </div>
                )}

                {mealPlan.is_freetyped && (
                  <div className="text-muted-foreground">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Custom meal entry
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCompletion}
              className={`${isMobile ? 'h-7 w-7 p-0' : 'h-8 w-8 p-0'} hover:bg-green-100`}
              title={mealPlan.is_completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {mealPlan.is_completed ? (
                <CheckCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-600`} />
              ) : (
                <Circle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${isMobile ? 'h-7 w-7 p-0' : 'h-8 w-8 p-0'} opacity-50 group-hover:opacity-100 transition-opacity`}
                >
                  <MoreHorizontal className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {canCreateLeftover && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => onCreateLeftover(mealPlan, recipe)}
                      className="text-sage"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Leftover
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem 
                  onClick={() => onRemove(mealPlan.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
