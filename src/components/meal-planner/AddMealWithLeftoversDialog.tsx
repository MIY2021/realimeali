
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Recipe } from "@/types";
import { getDisplayLabel } from "@/utils/recipeClassification";

interface AddMealWithLeftoversDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (recipeId: string, originalServings: number, leftoverServings: number) => void;
  recipes: Recipe[];
}

export function AddMealWithLeftoversDialog({
  open,
  onClose,
  onSubmit,
  recipes,
}: AddMealWithLeftoversDialogProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<string>("");
  const [originalServings, setOriginalServings] = useState<number>(4);
  const [leftoverServings, setLeftoverServings] = useState<number>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecipe) {
      onSubmit(selectedRecipe, originalServings, leftoverServings);
      onClose();
      setSelectedRecipe("");
      setOriginalServings(4);
      setLeftoverServings(2);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Meal with Leftovers</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipe">Recipe</Label>
            <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
              <SelectTrigger>
                <SelectValue placeholder="Select a recipe" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    <div className="flex items-center gap-2">
                      <span>{recipe.title}</span>
                      {recipe.mealType && (
                        <span className="text-xs text-muted-foreground">
                          ({getDisplayLabel(recipe.mealType, 'mealType')})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="originalServings">Original Servings</Label>
            <Input
              id="originalServings"
              type="number"
              min="1"
              value={originalServings}
              onChange={(e) => setOriginalServings(parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="leftoverServings">Leftover Servings</Label>
            <Input
              id="leftoverServings"
              type="number"
              min="1"
              max={originalServings}
              value={leftoverServings}
              onChange={(e) => setLeftoverServings(parseInt(e.target.value))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedRecipe}>
              Add Meal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
