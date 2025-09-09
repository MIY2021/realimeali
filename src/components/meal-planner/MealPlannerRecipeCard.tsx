import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Eye, Trash2, Plus, Minus, Check } from "lucide-react";
import { MealPlan, Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useNavigate } from "react-router-dom";
import { createRecipeUrl } from "@/utils/slugUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMealPlan } from "@/contexts/MealPlanContext";

interface MealPlannerRecipeCardProps {
  mealPlan: MealPlan;
  recipe?: Recipe;
  onRemove: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  animationDelay?: number;
}

export function MealPlannerRecipeCard({ 
  mealPlan, 
  recipe, 
  onRemove, 
  onCreateLeftover,
  animationDelay = 0 
}: MealPlannerRecipeCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [servings, setServings] = useState(mealPlan.planned_servings || recipe?.servings || 1);
  const { updateMealPlanCompletion, updateMealPlanServings } = useMealPlan();

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

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
    return "Custom meal created for this meal plan";
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
      className={`overflow-hidden transition-all duration-500 ease-out hover:shadow-lg ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-4 opacity-0 scale-95'
      }`}
      style={{ 
        transitionDelay: `${animationDelay}ms`,
        willChange: 'transform, opacity'
      }}
    >
      <div className="relative">
        <RecipeImage
          recipe={recipe}
          alt={getTitle()}
          className={`w-full object-cover ${isMobile ? 'h-40' : 'h-48'}`}
        />
        
        {/* Completion status badge */}
        {mealPlan.is_completed && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-500 text-white">
              Cooked
            </Badge>
          </div>
        )}

        {/* Leftover badge */}
        {mealPlan.is_leftover && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">
              Leftover
            </Badge>
          </div>
        )}
      </div>

      <CardContent className={`${isMobile ? 'p-3' : 'p-4'} space-y-3`}>
        {/* Title */}
        <h3 
          className={`font-semibold line-clamp-2 ${isMobile ? 'text-sm' : 'text-base'} ${
            !recipe ? 'cursor-pointer hover:underline' : ''
          }`}
          onClick={() => {
            if (!recipe && mealPlan.meal_name && mealPlan.meal_name.length > 30) {
              alert(mealPlan.meal_name);
            }
          }}
          title={!recipe ? "Click to see full name" : undefined}
        >
          {getTitle()}
        </h3>

        {/* Description */}
        {getDescription() && (
          <p className={`line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'} ${
            !recipe ? 'text-green-600' : 'text-muted-foreground'
          }`}>
            {getDescription()}
          </p>
        )}

        {/* Time and Servings */}
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-4">
            {getDuration() && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {getDuration()} min
                </span>
              </div>
            )}
          </div>
          
          {/* Servings controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                Servings:
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleServingsChange(servings - 1)}
                disabled={servings <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium min-w-[20px] text-center">
                {servings}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleServingsChange(servings + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {recipe ? (
            <Button
              variant="outline"
              onClick={handleViewRecipe}
              className="flex-1 flex items-center justify-center gap-1"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          ) : (
            <div className="flex-1" />
          )}
          
          <div className="flex gap-1">
            {/* Completion toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleCompletion}
              className={`${
                mealPlan.is_completed 
                  ? 'text-green-600 border-green-600 bg-green-50 hover:bg-green-100' 
                  : 'text-gray-600 border-gray-600 hover:bg-gray-50'
              }`}
              title={mealPlan.is_completed ? "Mark as not cooked" : "Mark as cooked"}
            >
              <Check className="h-4 w-4" />
            </Button>

            {recipe && onCreateLeftover && !mealPlan.is_leftover && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateLeftover}
                className="text-sage border-sage hover:bg-sage/10"
                title="Create leftover"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleRemove}
              className="text-red-600 border-red-600 hover:bg-red-50"
              title="Remove meal"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}