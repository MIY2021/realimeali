import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Eye, Trash2, Plus } from "lucide-react";
import { MealPlan, Recipe } from "@/types";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useNavigate } from "react-router-dom";
import { createRecipeUrl } from "@/utils/slugUtils";
import { useIsMobile } from "@/hooks/use-mobile";

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
        <h3 className={`font-semibold line-clamp-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
          {getTitle()}
        </h3>

        {/* Description */}
        {getDescription() && (
          <p className={`text-muted-foreground line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {getDescription()}
          </p>
        )}

        {/* Time and Servings */}
        <div className="flex items-center gap-4 text-muted-foreground">
          {getDuration() && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                {getDuration()} min
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
              {getServings()}
            </span>
          </div>
        </div>

        {/* Meal type badge */}
        <div className="flex justify-start">
          <Badge 
            variant="secondary" 
            className="capitalize bg-sage/20 text-sage hover:bg-sage/30"
          >
            {mealPlan.meal_type}
          </Badge>
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
            {recipe && onCreateLeftover && (
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