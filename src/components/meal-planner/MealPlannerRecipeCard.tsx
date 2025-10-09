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
      className={`overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
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
          className="w-full object-cover h-36 rounded-t-xl"
        />
        
        {/* Completion status badge */}
        {mealPlan.is_completed && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-sage text-white border-0 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm">
              Cooked
            </Badge>
          </div>
        )}

        {/* Leftover badge */}
        {mealPlan.is_leftover && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-white/90 text-navy border-0 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm">
              Leftover
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Title */}
        <h3 
          className="font-bold text-sm leading-tight text-navy line-clamp-2 min-h-[2.5rem]"
          onClick={() => {
            if (!recipe && mealPlan.meal_name && mealPlan.meal_name.length > 15) {
              toast({
                title: mealPlan.meal_name,
              });
            }
          }}
        >
          {getTitle()}
        </h3>

        {/* Subtext info */}
        <div className="text-xs text-grey-light">
          {!recipe ? (
            <span className="text-sage">Custom Meal</span>
          ) : (
            <span>
              {getDuration() && `${getDuration()} min`}
              {getDuration() && servings && " • "}
              {servings && `${servings} servings`}
            </span>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex gap-1.5 pt-1">
          {recipe && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewRecipe}
              className="h-7 px-2 text-grey-light hover:text-navy hover:bg-gray-50"
              title="View recipe"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          
          {/* Completion toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleCompletion}
            className={`h-7 px-2 ${
              mealPlan.is_completed 
                ? 'text-sage hover:text-sage hover:bg-sage/10' 
                : 'text-grey-light hover:text-navy hover:bg-gray-50'
            }`}
            title={mealPlan.is_completed ? "Mark as not cooked" : "Mark as cooked"}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>

          {recipe && onCreateLeftover && mealPlan.meal_type === 'dinner' && !mealPlan.is_leftover && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCreateLeftover}
              className="h-7 px-2 text-grey-light hover:text-navy hover:bg-gray-50"
              title="Create leftover"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          
          <div className="flex-1" />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            className="h-7 px-2 text-red-action hover:text-red-action hover:bg-red-50"
            title="Remove meal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}