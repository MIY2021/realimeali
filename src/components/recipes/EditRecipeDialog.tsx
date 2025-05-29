
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Recipe } from "@/types";
import { ChefHat, Plus, X } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { RecipeClassificationSelector } from "./create/RecipeClassificationSelector";

interface EditRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe;
}

export function EditRecipeDialog({ open, onOpenChange, recipe }: EditRecipeDialogProps) {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>({ ...recipe });
  const [saving, setSaving] = useState(false);
  const { updateRecipe } = useRecipes();
  const { toast } = useToast();

  useEffect(() => {
    if (recipe) {
      setEditedRecipe({ ...recipe });
    }
  }, [recipe]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedRecipe = await updateRecipe(editedRecipe.id, editedRecipe);
      if (updatedRecipe) {
        toast({
          title: "Recipe Updated",
          description: `${editedRecipe.title} has been updated.`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update recipe. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Recipe) => {
    setEditedRecipe({ ...editedRecipe, [field]: e.target.value });
  };

  const handleIngredientsChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = e.target.value;
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setEditedRecipe({ ...editedRecipe, ingredients: [...editedRecipe.ingredients, ""] });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients.splice(index, 1);
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients });
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedRecipe({ ...editedRecipe, instructions: [e.target.value] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-sage" />
            Edit Recipe
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedRecipe.title}
                onChange={(e) => handleInputChange(e, "title")}
              />
            </div>

            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={editedRecipe.servings}
                onChange={(e) => handleInputChange(e, "servings")}
              />
            </div>

            <div>
              <Label htmlFor="prepTime">Prep Time (minutes)</Label>
              <Input
                id="prepTime"
                type="number"
                value={editedRecipe.prepTime}
                onChange={(e) => handleInputChange(e, "prepTime")}
              />
            </div>

            <div>
              <Label htmlFor="cookTime">Cook Time (minutes)</Label>
              <Input
                id="cookTime"
                type="number"
                value={editedRecipe.cookTime}
                onChange={(e) => handleInputChange(e, "cookTime")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedRecipe.description}
              onChange={(e) => handleInputChange(e, "description")}
            />
          </div>

          <div>
            <Label>Ingredients</Label>
            {editedRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-2 mb-1">
                <Input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientsChange(e, index)}
                  className="flex-grow"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeIngredient(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={editedRecipe.instructions[0] || ""}
              onChange={handleInstructionsChange}
            />
          </div>

          <RecipeClassificationSelector
            recipe={editedRecipe}
            onRecipeChange={(updatedRecipe) => setEditedRecipe(updatedRecipe)}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Update Recipe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
