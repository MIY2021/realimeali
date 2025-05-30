
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";
import { RecipeImage } from "@/components/ui/recipe-image";

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

  // Create URL-friendly slug from recipe title
  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getRecipeUrl = () => {
    const recipeSlug = createSlug(recipe.title);
    return `/my-recipes/${recipeSlug}`;
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
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
        >
          <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{recipe.description}</p>
        
        <div className="flex items-center gap-2 mb-4">
          {recipe.meal_type && (
            <Badge variant="secondary">
              Meal Type: {capitalizeFirst(recipe.meal_type)}
            </Badge>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex gap-2 mt-auto">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
          >
            <Link to={getRecipeUrl()}>
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">View Recipe</span>
              <span className="sm:hidden">View</span>
            </Link>
          </Button>
          
          {showActions && (
            <Button
              variant="default"
              size="sm"
              className="flex-1 text-xs sm:text-sm"
              onClick={handleAddToMealPlan}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add to Meal Plan</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
