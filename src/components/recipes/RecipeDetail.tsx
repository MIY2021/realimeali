
import { useState } from "react";
import { Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeImage } from "@/components/ui/recipe-image";
import { EditRecipeDialog } from "./EditRecipeDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { UtensilsCrossed, Clock, Users, Share, Heart } from "lucide-react";
import { usePublicRecipeSharing } from "@/hooks/usePublicRecipeSharing";

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const [open, setOpen] = useState(false);
  const { updateRecipe } = useRecipes();
  const { toast } = useToast();
  const { shareRecipe, isSharing } = usePublicRecipeSharing();

  const handleFavoriteToggle = async () => {
    try {
      await updateRecipe(recipe.id, { 
        ...recipe,
        isFavorite: !recipe.isFavorite 
      });
      
      toast({
        title: recipe.isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
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

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold">{recipe.title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleFavoriteToggle}>
                <Heart
                  className={`h-5 w-5 ${recipe.isFavorite ? "text-red-500" : "text-muted-foreground"}`}
                />
                <span className="sr-only">Toggle Favorite</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} disabled={isSharing}>
                <Share className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Share Recipe</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
                <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Edit Recipe</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{recipe.description}</p>
        </CardHeader>
        <CardContent className="py-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-1">
              <RecipeImage recipe={recipe} className="rounded-md aspect-video object-cover w-full" />
            </div>

            <div className="sm:col-span-1 space-y-3">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">
                  <Clock className="h-4 w-4 mr-2" />
                  Prep: {recipe.prepTime}m
                </Badge>
                <Badge variant="secondary">
                  <Clock className="h-4 w-4 mr-2" />
                  Cook: {recipe.cookTime}m
                </Badge>
                <Badge variant="secondary">
                  <Users className="h-4 w-4 mr-2" />
                  Serves: {recipe.servings}
                </Badge>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Ingredients</h4>
                <ul className="list-disc list-inside text-sm">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Instructions</h4>
                <ol className="list-decimal list-inside text-sm">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditRecipeDialog open={open} onOpenChange={setOpen} recipe={recipe} />
    </>
  );
}
