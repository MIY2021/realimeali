
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";
import { RecipeImage } from "@/components/ui/recipe-image";
import { generateSlug } from "@/utils/slugUtils";

interface RecipeCardProps {
  recipe: Recipe;
  onAddToMealPlan: (recipe: Recipe) => void;
  showActions?: boolean;
}

export function RecipeCard({ recipe, onAddToMealPlan, showActions = true }: RecipeCardProps) {
  const { toggleFavorite } = useRecipes();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsTogglingFavorite(true);
    try {
      await toggleFavorite(recipe.id, !recipe.is_favorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleAddToMealPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToMealPlan(recipe);
  };

  const getRecipeUrl = () => {
    const recipeSlug = generateSlug(recipe.title);
    return `/my-recipes/${recipe.id}/${recipeSlug}`;
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <Card className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <div className="relative">
        <RecipeImage recipe={recipe} className="w-full h-48 object-cover rounded-t-lg" iconSize="h-5 w-5" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm hover:bg-white/90 transition-all duration-200"
        >
          <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
        </Button>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{recipe.description}</p>
        
        <div className="flex items-center gap-2 mb-4">
          {recipe.meal_type && (
            <Badge variant="secondary">
              {capitalizeFirst(recipe.meal_type)}
            </Badge>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex gap-2 mt-auto">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 text-xs px-2"
          >
            <Link to={getRecipeUrl()}>
              <Eye className="h-3 w-3 mr-1" />
              <span className="hidden xl:inline">View Recipe</span>
              <span className="xl:hidden">View</span>
            </Link>
          </Button>
          
          {showActions && (
            <Button
              variant="default"
              size="sm"
              className="flex-1 text-xs px-2"
              onClick={handleAddToMealPlan}
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="hidden xl:inline">Add to Meal Plan</span>
              <span className="xl:hidden">Add</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
