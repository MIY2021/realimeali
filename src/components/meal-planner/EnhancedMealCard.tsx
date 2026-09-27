
import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, GripVertical, UtensilsCrossed, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useToast } from "@/hooks/use-toast";

import { MealPlan, Recipe, MealType } from "@/types";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Link } from "react-router-dom";
import { generateSlug } from "@/utils/slugUtils";


// Generic drag handle props that work with both react-beautiful-dnd and dnd-kit
type DragHandleProps = Record<string, unknown> | null | undefined;

interface EnhancedMealCardProps {
  mealPlan: MealPlan;
  recipe?: Recipe;
  parentRecipe?: Recipe;
  onRemove: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe?: Recipe) => void;
  dragHandleProps?: DragHandleProps;
  leftoverMap: Map<string, MealPlan>; // Performance: Pre-computed leftover relationships
}

export function EnhancedMealCard({
  mealPlan,
  recipe,
  parentRecipe,
  onRemove,
  onCreateLeftover,
  dragHandleProps,
  leftoverMap,
}: EnhancedMealCardProps) {
  const { updateMealPlanCompletion, updateMealPlanServings } = useMealPlan();
  const { householdMembers } = useHousehold();
  const { toast } = useToast();

  const mealCreator = householdMembers.find(member => member.user_id === mealPlan.created_by);
  const creatorProfile = mealCreator?.profile;
  const creatorName =
    creatorProfile?.full_name ||
    creatorProfile?.email ||
    "Household member";
  const creatorInitials = creatorName
    .split(" ")
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();



  // Performance: O(1) lookup using pre-computed map instead of O(n) find()
  const existingLeftover = leftoverMap.get(mealPlan.id);
  const leftoverServings = existingLeftover?.planned_servings || existingLeftover?.leftover_servings || 0;

  // Initialize servings with leftover adjustment for dinner meals
  const initialServings = mealPlan.planned_servings || recipe?.servings || 1;
  const adjustedInitialServings = mealPlan.meal_type === 'dinner' && leftoverServings > 0
    ? initialServings - leftoverServings
    : initialServings;

  const [servings, setServings] = useState(adjustedInitialServings);

  // Update servings when leftovers change
  useEffect(() => {
    const recalculatedInitial = mealPlan.planned_servings || recipe?.servings || 1;
    const recalculatedAdjusted = mealPlan.meal_type === 'dinner' && leftoverServings > 0
      ? recalculatedInitial - leftoverServings
      : recalculatedInitial;
    
    setServings(recalculatedAdjusted);
  }, [leftoverServings, mealPlan.planned_servings, mealPlan.meal_type, recipe?.servings]);

  // Handle freetyped meals (no recipe)
  if (mealPlan.is_freetyped && !recipe) {
    return (
      <Card className={`w-full max-w-full bg-white border border-gray-200 hover:shadow-md transition-all overflow-hidden ${
        mealPlan.is_completed ? 'opacity-85 saturate-75' : ''
      }`}>
        <CardContent className="p-0">
        <div className="flex min-h-24 max-w-full overflow-hidden">
          {/* Custom meal image with placeholder */}
          <div className="w-24 h-20 flex-shrink-0 ml-2 my-2 mr-0 relative overflow-hidden rounded-md">
              <RecipeImage 
                recipe={undefined}
                alt={mealPlan.meal_name || 'Custom Meal'}
                imgClassName={`${
                  mealPlan.is_completed ? 'grayscale brightness-75' : ''
                }`}
                iconSize="h-6 w-6"
                fixedSize={true}
              />
              
              {/* Cooked icon - top-right */}
              {mealPlan.is_completed && (
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-green-500/80 flex items-center justify-center shadow-sm animate-scale-in-slow">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

          {/* Content Area */}
          <div className="flex-1 pl-2 pr-3 py-2 flex flex-col justify-center min-w-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 
                    className={`font-medium text-sm leading-tight max-w-[calc(100%-1.5rem)] cursor-pointer hover:underline line-clamp-2 ${
                      mealPlan.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}
                    onClick={() => {
                      console.log('Custom meal title clicked:', {
                        mealName: mealPlan.meal_name,
                        length: mealPlan.meal_name?.length
                      });
                      if (mealPlan.meal_name && mealPlan.meal_name.length > 15) {
                        console.log('Showing toast for:', mealPlan.meal_name);
                        toast({
                          title: mealPlan.meal_name,
                        });
                      } else {
                        console.log('Meal name too short, not showing toast');
                      }
                    }}
                    title="Tap to see full name"
                  >
                    {mealPlan.meal_name || 'Custom Meal'}
                  </h4>
                  <p className="text-xs text-green-600 mt-1">Custom meal</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Drag Handle - Large touch target for mobile */}
                  <div 
                    {...(dragHandleProps as React.HTMLAttributes<HTMLDivElement>)} 
                    className="touch-none cursor-grab active:cursor-grabbing p-2 -m-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between gap-0.5 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-[10px] text-gray-600 leading-none whitespace-nowrap">Servings:</span>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
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
                      <Minus className="h-2.5 w-2.5" />
                    </Button>
                    <span className="text-xs font-medium w-5 text-center">{servings}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
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
                      <Plus className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
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
                  
                  {/* Leftover Button for Custom Meals */}
                  {mealPlan.meal_type === 'dinner' && !mealPlan.is_leftover && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-7 w-7 p-0 transition-all ${
                        existingLeftover 
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                          : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                      }`}
                      onClick={() => onCreateLeftover(mealPlan)}
                      disabled={!!existingLeftover}
                      title={existingLeftover 
                        ? `${leftoverServings} servings saved for lunch` 
                        : 'Save leftovers for lunch'
                      }
                      aria-pressed={!!existingLeftover}
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
      // For dinner meals with leftovers, update database with full amount
      const dbServings = mealPlan.meal_type === 'dinner' && leftoverServings > 0
        ? newServings + leftoverServings
        : newServings;
      await updateMealPlanServings(mealPlan.id, dbServings);
    } catch (error) {
      console.error('Error updating servings:', error);
      setServings(servings); // Revert on error
    }
  };

  const handleServingsIncrease = async () => {
    const newServings = servings + 1;
    setServings(newServings);
    try {
      // For dinner meals with leftovers, update database with full amount
      const dbServings = mealPlan.meal_type === 'dinner' && leftoverServings > 0
        ? newServings + leftoverServings
        : newServings;
      await updateMealPlanServings(mealPlan.id, dbServings);
    } catch (error) {
      console.error('Error updating servings:', error);
      setServings(servings); // Revert on error
    }
  };

  const isLeftover = mealPlan.is_leftover;
  const isLunchLeftover = isLeftover && mealPlan.meal_type === 'lunch';
  
  // Servings already adjusted for display (no additional calculation needed)
  const displayServings = servings;

  // Generate recipe URL
  const recipeSlug = generateSlug(recipe.title);
  const recipeUrl = `/my-recipes/${recipeSlug}`;

  return (
    <Card className={`w-full max-w-full bg-white border border-gray-200 hover:shadow-md transition-all overflow-hidden ${
      mealPlan.is_completed ? 'opacity-85 saturate-75' : ''
    }`}>
      <CardContent className="p-0">
        <div className="flex min-h-24 max-w-full overflow-hidden">
          {/* Recipe Image - Slightly smaller with padding */}
          <div className="w-24 h-20 flex-shrink-0 ml-2 my-2 mr-0 relative overflow-hidden rounded-md">
            <Link to={recipeUrl}>
              <RecipeImage 
                recipe={recipe}
                useThumbnail={true}
                imgClassName={`cursor-pointer hover:opacity-80 transition-opacity ${
                  mealPlan.is_completed ? 'grayscale brightness-75' : ''
                }`}
                iconSize="h-6 w-6"
                fixedSize={true}
              />
            </Link>
            
            {/* Added-by corner cutout - top-left */}
            {mealCreator && (
              <div
                className="absolute right-0 top-0 z-10 h-8 w-8 overflow-hidden border-b border-l border-white bg-white shadow-sm [clip-path:polygon(0_0,100%_0,100%_100%)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-[141%] after:origin-left after:rotate-[-45deg] after:bg-white/90 after:shadow-[0_1px_2px_rgba(0,0,0,0.12)] after:content-['']"
                title={"Added by " + creatorName}
                aria-label={"Added by " + creatorName}
              >
                {creatorProfile?.avatar_url ? (
                  <img src={creatorProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : creatorProfile?.avatar_data ? (
                  <img src={creatorProfile.avatar_data} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gray-100 text-[7px] font-semibold text-gray-600">
                    {creatorInitials}
                  </span>
                )}
              </div>
            )}

            {/* Lunch Leftover icon - top-right */}
            {existingLeftover && (
              <div className="absolute top-0.5 right-5 w-4 h-4 rounded-full bg-yellow-500/80 flex items-center justify-center shadow-sm animate-scale-in-slow">
                <UtensilsCrossed className="h-2.5 w-2.5 text-white" />
              </div>
            )}
            
            {/* Cooked icon - top-right */}
            {mealPlan.is_completed && (
              <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-green-500/80 flex items-center justify-center shadow-sm animate-scale-in-slow">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Content Area - Reduced left padding to minimize white space */}
          <div className="flex-1 pl-2 pr-3 py-2 flex flex-col justify-center min-w-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                <Link to={recipeUrl}>
                  <h4 className={`font-medium text-sm leading-tight cursor-pointer hover:text-blue-600 transition-colors max-w-[calc(100%-1.5rem)] line-clamp-2 ${
                    mealPlan.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}>
                    {recipe.title}
                  </h4>
                </Link>
                
                {isLunchLeftover && parentRecipe && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Leftover
                  </p>
                )}
              </div>
              <div className="relative flex items-center gap-2 flex-shrink-0">
                {/* Drag Handle - Large touch target for mobile */}
                <div 
                  {...(dragHandleProps as React.HTMLAttributes<HTMLDivElement>)} 
                  className="touch-none cursor-grab active:cursor-grabbing p-2 -m-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between gap-0.5 w-full max-w-full overflow-hidden">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <span className="text-[10px] text-gray-600 leading-none whitespace-nowrap">Servings:</span>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={handleServingsDecrease}
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </Button>
                  <span className="text-xs font-medium w-5 text-center">{displayServings}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={handleServingsIncrease}
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
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
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                        : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                    }`}
                    onClick={handleCreateLeftover}
                    disabled={!!existingLeftover}
                    title={existingLeftover 
                      ? `${leftoverServings} servings saved for lunch` 
                      : 'Save leftovers for lunch'
                    }
                    aria-pressed={!!existingLeftover}
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
