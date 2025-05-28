
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SpoonacularRecipe } from "@/hooks/useSpoonacularApi";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { Recipe } from "@/types";

interface SaveRecipeDialogProps {
  recipe: SpoonacularRecipe;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaveRecipeDialog = ({ recipe, isOpen, onOpenChange }: SaveRecipeDialogProps) => {
  const { createRecipe } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(recipe.servings || 4);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState((recipe.readyInMinutes || 30) - 15);

  // Convert Spoonacular ingredients to our format
  const convertedIngredients = recipe.extendedIngredients?.map(ing => ing.original) || [];
  
  // Convert Spoonacular instructions to our format
  const convertedInstructions = recipe.analyzedInstructions?.[0]?.steps?.map(step => step.step) || [];

  const cleanSummary = (summary?: string) => {
    if (!summary) return "";
    // Remove HTML tags
    return summary.replace(/<[^>]*>/g, "").trim();
  };

  const handleSave = async () => {
    if (!currentHousehold) {
      toast({
        title: "Error",
        description: "No household selected",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
        title,
        description: description || cleanSummary(recipe.summary),
        ingredients: convertedIngredients,
        instructions: convertedInstructions,
        categories: recipe.diets?.map(diet => diet as any) || [],
        prepTime,
        cookTime,
        servings,
        image: recipe.image,
        topTip: recipe.sourceUrl ? `Original recipe: ${recipe.sourceUrl}` : undefined,
        isFavorite: false,
        householdId: currentHousehold.id,
      };

      const savedRecipe = await createRecipe(recipeData, currentHousehold.id);
      
      if (savedRecipe) {
        toast({
          title: "Recipe Saved!",
          description: `${title} has been added to your recipes.`,
        });
        onOpenChange(false);
      } else {
        throw new Error("Failed to save recipe");
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save Recipe to My Recipes</DialogTitle>
          <DialogDescription>
            Review and customize this recipe before saving it to your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Image and Basic Info */}
          <div className="flex gap-4">
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {recipe.readyInMinutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.readyInMinutes}m total</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
                {recipe.sourceUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(recipe.sourceUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Original
                  </Button>
                )}
              </div>
              {recipe.diets && recipe.diets.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {recipe.diets.map((diet) => (
                    <Badge key={diet} variant="outline" className="text-xs">
                      {diet}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Recipe Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={cleanSummary(recipe.summary)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="cookTime">Cook Time (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Preview of ingredients and instructions */}
          <div className="space-y-4">
            <div>
              <Label>Ingredients ({convertedIngredients.length})</Label>
              <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {convertedIngredients.slice(0, 5).map((ingredient, index) => (
                    <li key={index}>• {ingredient}</li>
                  ))}
                  {convertedIngredients.length > 5 && (
                    <li className="text-muted-foreground">... and {convertedIngredients.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>

            <div>
              <Label>Instructions ({convertedInstructions.length} steps)</Label>
              <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                <ol className="text-sm space-y-1">
                  {convertedInstructions.slice(0, 3).map((instruction, index) => (
                    <li key={index}>{index + 1}. {instruction}</li>
                  ))}
                  {convertedInstructions.length > 3 && (
                    <li className="text-muted-foreground">... and {convertedInstructions.length - 3} more steps</li>
                  )}
                </ol>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex-1 bg-terracotta hover:bg-terracotta/90"
            >
              {isSaving ? "Saving..." : "Save to My Recipes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
