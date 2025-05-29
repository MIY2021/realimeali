
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, Plus, X } from "lucide-react";

interface EditRecipeDialogProps {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeUpdate: (recipe: Recipe) => void;
}

export function EditRecipeDialog({
  recipe,
  open,
  onOpenChange,
  onRecipeUpdate,
}: EditRecipeDialogProps) {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedRecipe(recipe);
  }, [recipe]);

  const handleSave = async () => {
    if (!editedRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required",
        variant: "destructive",
      });
      return;
    }

    if (editedRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    if (editedRecipe.instructions.length === 0) {
      toast({
        title: "Error",
        description: "At least one instruction is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      onRecipeUpdate(editedRecipe);
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Recipe updated successfully!",
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setEditedRecipe({
        ...editedRecipe,
        ingredients: [...editedRecipe.ingredients, newIngredient.trim()],
      });
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setEditedRecipe({
      ...editedRecipe,
      ingredients: editedRecipe.ingredients.filter((_, i) => i !== index),
    });
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setEditedRecipe({
        ...editedRecipe,
        instructions: [...editedRecipe.instructions, newInstruction.trim()],
      });
      setNewInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    setEditedRecipe({
      ...editedRecipe,
      instructions: editedRecipe.instructions.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
          <DialogDescription>
            Make changes to your recipe. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedRecipe.title}
              onChange={(e) =>
                setEditedRecipe({ ...editedRecipe, title: e.target.value })
              }
              placeholder="Recipe title"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedRecipe.description}
              onChange={(e) =>
                setEditedRecipe({ ...editedRecipe, description: e.target.value })
              }
              placeholder="Brief description of your recipe"
              className="min-h-[80px]"
            />
          </div>

          {/* Recipe Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prepTime">
                <Clock className="h-4 w-4 inline mr-1" />
                Prep Time (min)
              </Label>
              <Input
                id="prepTime"
                type="number"
                value={editedRecipe.prep_time || ""}
                onChange={(e) =>
                  setEditedRecipe({
                    ...editedRecipe,
                    prep_time: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cookTime">
                <Clock className="h-4 w-4 inline mr-1" />
                Cook Time (min)
              </Label>
              <Input
                id="cookTime"
                type="number"
                value={editedRecipe.cook_time || ""}
                onChange={(e) =>
                  setEditedRecipe({
                    ...editedRecipe,
                    cook_time: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="servings">
                <Users className="h-4 w-4 inline mr-1" />
                Servings
              </Label>
              <Input
                id="servings"
                type="number"
                value={editedRecipe.servings || ""}
                onChange={(e) =>
                  setEditedRecipe({
                    ...editedRecipe,
                    servings: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="grid gap-2">
            <Label>Ingredients</Label>
            <div className="space-y-2">
              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm flex-1 p-2 bg-gray-50 rounded">
                    {ingredient}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add new ingredient"
                  onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                />
                <Button type="button" onClick={addIngredient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="grid gap-2">
            <Label>Instructions</Label>
            <div className="space-y-2">
              {editedRecipe.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm flex-1 p-2 bg-gray-50 rounded min-h-[40px]">
                    {instruction}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="Add new instruction"
                  className="min-h-[60px]"
                />
                <Button type="button" onClick={addInstruction} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Recipe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
