import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Trash2, Plus, Minus, Check, UtensilsCrossed } from "lucide-react";
import { MealPlan, Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useNavigate } from "react-router-dom";
import { createRecipeUrl } from "@/utils/slugUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";

interface MealPlannerRecipeCardProps {
  mealPlan: MealPlan;
  recipe?: Recipe;
  onRemove: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  allMealPlans?: MealPlan[];
}

export function MealPlannerRecipeCard({ 
  mealPlan, 
  recipe, 
  onRemove, 
  onCreateLeftover,
  allMealPlans = []
}: MealPlannerRecipeCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [servings, setServings] = useState(mealPlan.planned_servings || recipe?.servings || 1);
  const { updateMealPlanCompletion, updateMealPlanServings } = useMealPlan();
  const { householdMembers } = useHousehold();
  const { toast } = useToast();

  const mealCreator = householdMembers.find(member => member.user_id === mealPlan.created_by);
  const creatorProfile = mealCreator?.profile;
  const creatorName = creatorProfile?.full_name || creatorProfile?.email || "Household member";
  const creatorInitials = creatorName
    .split(" ")
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Track leftover state for styling
  const existingLeftover = allMealPlans.find(plan => 
    plan.parent_meal_plan_id === mealPlan.id && 
    plan.is_leftover && 
    plan.meal_type === 'lunch'
  );
  const leftoverServings = existingLeftover?.planned_servings || existingLeftover?.leftover_servings || 0;

  const handleViewRecipe = () => {
    if (recipe) {
      const url = createRecipeUrl(recipe);
      navigate(url);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(mealPlan.id);
  };

  const handleCreateLeftover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (recipe && onCreateLeftover) {
      onCreateLeftover(mealPlan, recipe);
    }
  };

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateMealPlanCompletion(mealPlan.id, !mealPlan.is_completed);
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const handleServingsChange = async (newServings: number) => {
    if (newServings < 1) return;
    setServings(newServings);
    try {
      await updateMealPlanServings(mealPlan.id, newServings);
    } catch (error) {
      console.error('Failed to update servings:', error);
    }
  };

  const getTitle = () => {
    if (recipe) return recipe.title;
    if (mealPlan.meal_name) return mealPlan.meal_name;
    return "Custom Meal";
  };

  const getDescription = () => {
    if (recipe) return recipe.description || "";
    return "Custom Meal";
  };

  const getDuration = () => {
    if (recipe?.prep_time && recipe?.cook_time) {
      return recipe.prep_time + recipe.cook_time;
    }
    if (recipe?.prep_time) return recipe.prep_time;
    if (recipe?.cook_time) return recipe.cook_time;
    return null;
  };

  const getServings = () => {
    return mealPlan.planned_servings || recipe?.servings || 1;
  };

  return (
    <Card 
      className={`overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 ${
        mealPlan.is_completed ? 'opacity-85 saturate-75' : ''
      }`}
    >
      <div 
        className="relative cursor-pointer" 
        onClick={recipe ? handleViewRecipe : undefined}
      >
        <RecipeImage
          recipe={recipe}
          useThumbnail={true}
          alt={getTitle()}
          imgClassName={`${
            mealPlan.is_completed ? 'grayscale brightness-75' : ''
          }`}
        />
        
        {/* Added-by corner cutout - top-left */}
        {mealCreator && (
          <div
            className="absolute right-0 top-0 z-10 h-10 w-10 overflow-hidden border-b-2 border-l-2 border-white bg-white shadow-sm [clip-path:polygon(0_0,100%_0,100%_100%)] after:absolute after:left-0 after:top-0 after:h-px after:w-[141%] after:origin-left after:rotate-[45deg] after:bg-white/80 after:shadow-[0_1px_2px_rgba(0,0,0,0.10)] after:content-['']"
            title={"Added by " + creatorName}
            aria-label={"Added by " + creatorName}
          >
            {creatorProfile?.avatar_url ? (
              <img src={creatorProfile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : creatorProfile?.avatar_data ? (
              <img src={creatorProfile.avatar_data} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-gray-600">
                {creatorInitials}
              </span>
            )}
          </div>
        )}

        {/* Lunch Leftover icon - top-left */}
        {existingLeftover && (
          <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-yellow-500/80 flex items-center justify-center shadow-sm animate-scale-in-slow">
            <UtensilsCrossed className="h-3 w-3 text-white" />
          </div>
        )}
        
        {/* Cooked icon - top-right */}
        {mealPlan.is_completed && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500/80 flex items-center justify-center shadow-sm animate-scale-in-slow">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-1.5">
        {/* Title */}
        <h3 
          className={`font-bold text-sm text-navy ${
            mealPlan.is_completed ? 'line-through text-gray-400' : ''
          } ${recipe ? 'cursor-pointer hover:text-terracotta transition-colors' : ''}`}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1.2',
          } as React.CSSProperties}
          onClick={() => {
            if (recipe) {
              handleViewRecipe();
            } else if (mealPlan.meal_name && mealPlan.meal_name.length > 15) {
              toast({
                title: mealPlan.meal_name,
              });
            }
          }}
        >
          {getTitle()}
        </h3>

        {/* Servings Stepper */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Servings:</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 focus:ring-2 focus:ring-[#7CC4A0] focus:ring-offset-2"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const newServings = Math.max(1, servings - 1);
                setServings(newServings);
                try {
                  await updateMealPlanServings(mealPlan.id, newServings);
                } catch (error) {
                  console.error('Failed to update servings:', error);
                  setServings(servings);
                }
              }}
              disabled={servings <= 1}
              aria-label="Decrease servings"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-6 text-center">{servings}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 focus:ring-2 focus:ring-[#7CC4A0] focus:ring-offset-2"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const newServings = servings + 1;
                setServings(newServings);
                try {
                  await updateMealPlanServings(mealPlan.id, newServings);
                } catch (error) {
                  console.error('Failed to update servings:', error);
                  setServings(servings);
                }
              }}
              aria-label="Increase servings"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-end gap-2 mt-2">
          {/* Save custom meal as a full recipe */}
          {mealPlan.is_freetyped && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] whitespace-nowrap text-[#B85F49] border-[#B85F49]/30 hover:bg-[#B85F49]/10 focus:ring-2 focus:ring-[#7CC4A0] focus:ring-offset-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const params = new URLSearchParams({
                  title: mealPlan.meal_name || "Custom Meal",
                  servings: String(mealPlan.planned_servings || 1),
                  meal_type: mealPlan.meal_type,
                  meal_plan_id: mealPlan.id,
                  source: "custom-meal",
                });
                navigate(`/my-recipes/new?${params.toString()}`);
              }}
              title="Save as recipe"
            >
              Save as Recipe
            </Button>
          )}

          {/* Completion toggle */}
          <Button
            variant="outline"
            size="sm"
            className={`h-7 w-7 p-0 focus:ring-2 focus:ring-[#7CC4A0] focus:ring-offset-2 ${
              mealPlan.is_completed 
                ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={handleToggleCompletion}
            title={mealPlan.is_completed ? "Mark as incomplete" : "Mark as complete"}
            aria-pressed={mealPlan.is_completed}
          >
            <Check className="h-3 w-3" />
          </Button>

          {/* Lunch Leftover button - Only for dinner meals */}
          {recipe && onCreateLeftover && mealPlan.meal_type === 'dinner' && !mealPlan.is_leftover && (
            <Button
              variant="outline"
              size="sm"
              className={`h-7 w-7 p-0 transition-all focus:ring-2 focus:ring-[#7CC4A0] focus:ring-offset-2 ${
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
          
          {/* Delete */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-[#7CC4A0] focus:ring-offset-2"
            onClick={handleRemove}
            title="Remove meal"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}