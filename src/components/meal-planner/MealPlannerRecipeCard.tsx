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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
          className={`w-full object-cover ${isMobile ? 'h-32' : 'h-48'}`}
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

      <CardContent className={`${isMobile ? 'p-3' : 'p-4'} space-y-2`}>
        {/* Title */}
        <h3 
          className={`font-semibold line-clamp-1 ${isMobile ? 'text-sm leading-tight' : 'text-base'} ${
            !recipe ? 'cursor-pointer hover:underline' : ''
          }`}
          onClick={() => {
            if (!recipe && mealPlan.meal_name && mealPlan.meal_name.length > 15) {
              toast({
                title: mealPlan.meal_name,
              });
            }
          }}
          title={!recipe ? "Tap to see full name" : undefined}
        >
          {getTitle()}
        </h3>

        {/* Description - Only show for custom meals and make it compact */}
        {!recipe && getDescription() && (
          <p className={`line-clamp-1 ${isMobile ? 'text-xs' : 'text-sm'} text-green-600`}>
            {getDescription()}
          </p>
        )}

        {/* Compact info row */}
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-3">
            {getDuration() && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{getDuration()} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="text-xs">{servings}</span>
            </div>
          </div>
          
          {/* Compact servings controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => handleServingsChange(servings - 1)}
              disabled={servings <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => handleServingsChange(servings + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Compact action buttons */}
        <div className="flex gap-1 pt-1">
          {recipe && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewRecipe}
              className="flex-1 h-8 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
          
          {/* Completion toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleCompletion}
            className={`h-8 w-8 p-0 ${
              mealPlan.is_completed 
                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                : 'hover:bg-gray-100'
            }`}
            title={mealPlan.is_completed ? "Mark as not cooked" : "Mark as cooked"}
          >
            <Check className="h-3 w-3" />
          </Button>

          {recipe && onCreateLeftover && !mealPlan.is_leftover && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCreateLeftover}
              className="h-8 w-8 p-0 text-sage hover:bg-sage/10"
              title="Create leftover"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
            title="Remove meal"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}