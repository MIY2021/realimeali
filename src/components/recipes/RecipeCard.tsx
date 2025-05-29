import { useState } from "react";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Clock, Users, Share, Plus } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { usePublicRecipeSharing } from "@/hooks/usePublicRecipeSharing";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, showActions = true, onAddToMealPlan }: RecipeCardProps) {
  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false);
  const { toggleFavorite } = useRecipes();
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
      await toggleFavorite(recipe.id, !recipe.isFavorite);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="p-0 overflow-hidden">
        <RecipeImage recipe={recipe} className="object-cover w-full h-48" iconSize="h-5 w-5" />
      </CardHeader>
      
      <CardContent className="flex flex-col gap-3 py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg truncate">{recipe.title}</h3>
          {recipe.mealType && (
            <Badge variant="secondary" className="uppercase">{recipe.mealType.replace(/_/g, ' ')}</Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground truncate">{recipe.description}</p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4" />
          {recipe.prepTime + recipe.cookTime} mins
          <span className="mx-1">•</span>
          <Users className="h-4 w-4" />
          {recipe.servings} servings
        </div>

        {showActions && (
          <div className="flex items-center justify-end gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFavorite}
              className="px-2.5"
            >
              <Heart className="h-4 w-4 mr-2" fill={recipe.isFavorite ? "currentColor" : "none"} />
              {recipe.isFavorite ? "Unfavorite" : "Favorite"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              className="px-2.5"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button size="sm" onClick={handleAddToMealPlanClick}>
              <Plus className="h-4 w-4 mr-2" />
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
