import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MealDBRecipe } from "@/types/mealdb";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";

interface SaveMealDBRecipeDialogProps {
  recipe: MealDBRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveMealDBRecipeDialog({ recipe, open, onOpenChange }: SaveMealDBRecipeDialogProps) {
  const [editedTitle, setEditedTitle] = useState(recipe?.strMeal || "");
  const [editedDescription, setEditedDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const { createRecipe } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!recipe || !user || !currentHousehold) return;
    
    setSaving(true);
    try {
      const newRecipe = {
        title: editedTitle,
        description: editedDescription || recipe.strInstructions?.substring(0, 200) || "",
        ingredients: recipe.ingredients || [],
        instructions: recipe.strInstructions ? [recipe.strInstructions] : [],
        prepTime: 0,
        cookTime: 0,
        servings: 4,
        image: recipe.strMealThumb || undefined,
        isFavorite: false,
        householdId: currentHousehold.id,
      };

      const savedRecipe = await createRecipe(newRecipe, currentHousehold.id);
      
      if (savedRecipe) {
        toast({
          title: "Recipe Saved",
          description: `${editedTitle} has been added to your recipes.`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save MealDB Recipe</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Recipe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
