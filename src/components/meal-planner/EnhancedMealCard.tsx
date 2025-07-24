
import { useState } from "react";
import { Trash2, Plus, Minus, GripVertical, UtensilsCrossed, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MealPlan, Recipe, MealType } from "@/types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { Link } from "react-router-dom";
import { generateSlug } from "@/utils/slugUtils";
import { FruitVegIndicator } from "@/components/nutrition/FruitVegIndicator";

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
  const { updateMealPlanCompletion, updateMealPlanServings } = useMealPlan();

  // Handle freetyped meals (no recipe)
  if (mealPlan.is_freetyped && !recipe) {
    return (
      <Card className={`bg-white border border-gray-200 hover:shadow-md transition-all overflow-hidden ${
        mealPlan.is_completed ? 'opacity-40 saturate-50' : ''
      }`}>
        <CardContent className="p-0">
          <div className="flex h-24">
            {/* Custom meal icon */}
            <div className="w-20 h-20 flex-shrink-0 m-2 bg-blue-50 rounded flex items-center justify-center">
              <UtensilsCrossed className={`h-8 w-8 text-blue-400 ${
                mealPlan.is_completed ? 'text-gray-400' : ''
              }`} />
            </div>

            {/* Content Area */}
            <div className="flex-1 pl-2 pr-4 py-4 flex flex-col justify-between min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm leading-tight ${
                    mealPlan.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}>
                    {mealPlan.meal_name || 'Custom Meal'}
                  </h4>
                  <p className="text-xs text-blue-600 mt-1">Custom meal</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Drag Handle */}
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
                      onClick={async () => {
                        const newServings = Math.max(1, servings - 1);
                        setServings(newServings);
                        try {
                          await updateMealPlanServings(mealPlan.id, newServings);
                        } catch (error) {
                          console.error('Error updating servings:', error);
                          setServings(servings);
                        }
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{servings}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={async () => {
                        const newServings = servings + 1;
                        setServings(newServings);
                        try {
                          await updateMealPlanServings(mealPlan.id, newServings);
                        } catch (error) {
                          console.error('Error updating servings:', error);
                          setServings(servings);
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Completion Tick Icon */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 w-7 p-0 ${
                      mealPlan.is_completed 
                        ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={async () => {
                      try {
                        await updateMealPlanCompletion(mealPlan.id, !mealPlan.is_completed);
                      } catch (error) {
                        console.error('Error updating meal completion:', error);
                      }
                    }}
                    title={mealPlan.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  
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

  const handleCompletionChange = async () => {
    try {
      await updateMealPlanCompletion(mealPlan.id, !mealPlan.is_completed);
    } catch (error) {
      console.error('Error updating meal completion:', error);
    }
  };

  const handleServingsDecrease = async () => {
    const newServings = Math.max(1, servings - 1);
    setServings(newServings);
    try {
      await updateMealPlanServings(mealPlan.id, newServings);
    } catch (error) {
      console.error('Error updating servings:', error);
      setServings(servings); // Revert on error
    }
  };

  const handleServingsIncrease = async () => {
    const newServings = servings + 1;
    setServings(newServings);
    try {
      await updateMealPlanServings(mealPlan.id, newServings);
    } catch (error) {
      console.error('Error updating servings:', error);
      setServings(servings); // Revert on error
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

  // Calculate actual servings to display for dinner meals
  const displayServings = mealPlan.meal_type === 'dinner' && existingLeftover && leftoverServings
    ? (mealPlan.planned_servings || recipe.servings) - leftoverServings
    : (mealPlan.planned_servings || recipe.servings);

  // Enhanced debugging for leftover button
  console.log('EnhancedMealCard - Leftover button debug:', {
    mealPlanId: mealPlan.id,
    mealType: mealPlan.meal_type,
    recipeTitle: recipe.title,
    hasExistingLeftover: !!existingLeftover,
    existingLeftoverId: existingLeftover?.id,
    leftoverServings,
    allMealPlansCount: allMealPlans.length,
    shouldShowGreen: !!(existingLeftover && mealPlan.meal_type === 'dinner' && !isLeftover)
  });

  // Generate recipe URL
  const recipeSlug = generateSlug(recipe.title);
  const recipeUrl = `/my-recipes/${recipeSlug}`;

  return (
    <Card className={`bg-white border border-gray-200 hover:shadow-md transition-all overflow-hidden ${
      mealPlan.is_completed ? 'opacity-40 saturate-50' : ''
    }`}>
      <CardContent className="p-0">
        <div className="flex h-24">
          {/* Recipe Image - Slightly smaller with padding */}
          <div className="w-20 h-20 flex-shrink-0 m-2">
            <Link to={recipeUrl}>
              <img 
                src={recipe.image || "/placeholder.svg"} 
                alt={recipe.title}
                className={`w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity ${
                  mealPlan.is_completed ? 'grayscale' : ''
                }`}
              />
            </Link>
          </div>

          {/* Content Area - Reduced left padding to minimize white space */}
          <div className="flex-1 pl-2 pr-4 py-4 flex flex-col justify-between min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <Link to={recipeUrl}>
                  <h4 className={`font-medium text-sm leading-tight truncate cursor-pointer hover:text-blue-600 transition-colors ${
                    mealPlan.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}>
                    {recipe.title}
                  </h4>
                </Link>
                {isLunchLeftover && parentRecipe && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leftover
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Drag Handle - Moved to right side */}
                <div {...dragHandleProps} className="touch-none cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Servings:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={handleServingsDecrease}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{displayServings}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={handleServingsIncrease}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Nutrition Indicator */}
                {recipe.fruit_veg_portions && recipe.fruit_veg_portions > 0 && (
                  <FruitVegIndicator 
                    portions={recipe.fruit_veg_portions} 
                    size="small"
                    showLabel={false}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Completion Tick Icon */}
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 w-7 p-0 ${
                    mealPlan.is_completed 
                      ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={handleCompletionChange}
                  title={mealPlan.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  <Check className="h-3 w-3" />
                </Button>
                
                {/* Lunch Button - Fixed color logic */}
                {!isLeftover && mealPlan.meal_type === 'dinner' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 w-7 p-0 transition-all ${
                      existingLeftover 
                        ? 'bg-green-500 text-white border-green-500 hover:bg-green-600 shadow-sm' 
                        : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
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
