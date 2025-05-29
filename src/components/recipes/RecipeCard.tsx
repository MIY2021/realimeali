
import { useState } from "react";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, Clock, Users, Eye, Plus } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, showActions = true, onAddToMealPlan }: RecipeCardProps) {
  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false);
  const { updateRecipe } = useRecipes();
  const { toast } = useToast();

  const handleAddToMealPlanClick = () => {
    if (onAddToMealPlan) {
      onAddToMealPlan(recipe);
    } else {
      setShowAddToMealPlan(true);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const updatedRecipe = { ...recipe, isFavorite: !recipe.isFavorite };
      await updateRecipe(recipe.id, updatedRecipe);
      toast({
        title: recipe.isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card text-card-foreground h-full flex flex-col overflow-hidden">
      <CardHeader className="p-0 overflow-hidden">
        <div className="relative">
          <RecipeImage recipe={recipe} className="object-cover w-full h-48" iconSize="h-5 w-5" />
          
          {/* Heart overlay in top-left */}
          <button
            onClick={handleFavorite}
            className="absolute top-2 left-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 hover:scale-110"
          >
            <Heart 
              className="h-4 w-4 text-red-500" 
              fill={recipe.isFavorite ? "currentColor" : "none"}
            />
          </button>

          {/* Meal type badge in top-right */}
          {recipe.mealType && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 bg-white/90 text-gray-700 backdrop-blur-sm border-0 shadow-sm flex items-center gap-1"
            >
              <span className="text-xs font-medium">
                {recipe.mealType.charAt(0).toUpperCase() + recipe.mealType.slice(1)}
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-3 py-4 px-4 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg truncate">{recipe.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{recipe.description}</p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4" />
          {recipe.prepTime + recipe.cookTime} mins
          <span className="mx-1">•</span>
          <Users className="h-4 w-4" />
          {recipe.servings} servings
        </div>

        {showActions && (
          <div className="flex items-center gap-2 mt-auto pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
              <Link to={`/recipe/${recipe.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Link>
            </Button>

            <Button size="sm" onClick={handleAddToMealPlanClick} className="flex-1 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add to Meal Plan
            </Button>
          </div>
        )}
      </CardContent>

      <AddToMealPlanDialog
        recipe={recipe}
        open={showAddToMealPlan}
        onOpenChange={setShowAddToMealPlan}
      />
    </Card>
  );
}
