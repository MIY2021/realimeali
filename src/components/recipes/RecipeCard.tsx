
import { useState } from "react";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, Clock, Users, Share, Plus, Eye } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { usePublicRecipeSharing } from "@/hooks/usePublicRecipeSharing";
import { Link } from "react-router-dom";
import { getDisplayLabel, getIcon } from "@/utils/recipeClassification";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, showActions = true, onAddToMealPlan }: RecipeCardProps) {
  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false);
  const { updateRecipe } = useRecipes();
  const { toast } = useToast();
  const { shareRecipe, isSharing } = usePublicRecipeSharing();

  const handleAddToMealPlanClick = () => {
    if (onAddToMealPlan) {
      onAddToMealPlan(recipe);
    } else {
      setShowAddToMealPlan(true);
    }
  };

  const handleShare = async () => {
    const shareUrl = await shareRecipe(recipe);
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Recipe Shared!",
        description: "Share link copied to clipboard.",
      });
    }
  };

  const handleFavorite = async () => {
    try {
      await updateRecipe(recipe.id, { ...recipe, isFavorite: !recipe.isFavorite });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card text-card-foreground h-full flex flex-col">
      <CardHeader className="p-0 overflow-hidden">
        <div className="relative">
          <RecipeImage recipe={recipe} className="object-cover w-full h-48" iconSize="h-5 w-5" />
          {recipe.mealType && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 bg-white/90 text-gray-700 backdrop-blur-sm border-0 shadow-sm flex items-center gap-1"
            >
              <span className="text-sm">{getIcon(recipe.mealType, 'mealType')}</span>
              <span className="text-xs font-medium">{getDisplayLabel(recipe.mealType, 'mealType')}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-3 py-4 px-4 sm:px-6 flex-1">
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
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavorite}
                className="flex-1"
              >
                <Heart className="h-4 w-4 mr-2" fill={recipe.isFavorite ? "currentColor" : "none"} />
                {recipe.isFavorite ? "Unfavorite" : "Favorite"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={isSharing}
                className="flex-1"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to={`/recipe/${recipe.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Recipe
                </Link>
              </Button>

              <Button size="sm" onClick={handleAddToMealPlanClick} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add to Meal Plan
              </Button>
            </div>
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
