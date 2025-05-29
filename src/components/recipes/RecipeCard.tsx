import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
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
      await toggleFavorite(recipe.id, !recipe.isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Card className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <Link to={`/recipes/${recipe.id}`} className="block h-full">
        <div className="relative">
          <RecipeImage recipe={recipe} className="w-full h-48 object-cover rounded-t-lg" iconSize="h-5 w-5" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
          >
            <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{recipe.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
          
          <div className="flex items-center gap-2 mt-3">
            {recipe.mealType && (
              <Badge variant="secondary">{recipe.mealType}</Badge>
            )}
            {recipe.complexityLevel && (
              <Badge variant="outline">{recipe.complexityLevel}</Badge>
            )}
          </div>
        </CardContent>
      </Link>

      {showActions && (
        <div className="p-4 border-t bg-muted/50 last:rounded-b-lg">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onAddToMealPlan(recipe)}
          >
            Add to Meal Plan
          </Button>
        </div>
      )}
    </Card>
  );
}
