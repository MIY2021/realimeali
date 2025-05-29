
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SpoonacularRecipe } from "@/types/spoonacular";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";

interface SaveRecipeDialogProps {
  recipe: SpoonacularRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveRecipeDialog({ recipe, open, onOpenChange }: SaveRecipeDialogProps) {
  const [editedTitle, setEditedTitle] = useState(recipe?.title || "");
  const [editedDescription, setEditedDescription] = useState(recipe?.summary?.replace(/<[^>]*>/g, '') || "");
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
        description: editedDescription || recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) || "",
        ingredients: recipe.extendedIngredients?.map(ing => ing.original) || [],
        instructions: recipe.instructions ? [recipe.instructions] : [],
        prepTime: 0,
        cookTime: recipe.readyInMinutes || 0,
        servings: recipe.servings || 4,
        image: recipe.image || undefined,
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
          <DialogTitle>Save Recipe</DialogTitle>
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
              rows={3}
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
