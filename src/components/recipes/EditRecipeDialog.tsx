import { useState, useEffect } from "react";
import { Recipe, RecipeCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, X } from "lucide-react";

interface EditRecipeDialogProps {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Recipe) => void;
}

// List of available categories
const AVAILABLE_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", 
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", 
  "Faffy", "Pricey!", "Not Yet Made"
];

export function EditRecipeDialog({ recipe, open, onOpenChange, onSave }: EditRecipeDialogProps) {
  const { toast } = useToast();
  const [editedRecipe, setEditedRecipe] = useState<Recipe>({ ...recipe });
  const [newCategory, setNewCategory] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(recipe.image || null);

  useEffect(() => {
    if (open) {
      setEditedRecipe({ ...recipe });
      setImagePreview(recipe.image || null);
    }
  }, [recipe, open]);

  const handleSave = () => {
    // Basic validation
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

    onSave({
      ...editedRecipe,
      updatedAt: new Date().toISOString(),
    });

    toast({
      title: "Success",
      description: "Recipe updated successfully",
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !editedRecipe.categories.includes(newCategory as RecipeCategory)) {
      setEditedRecipe({
        ...editedRecipe,
        categories: [...editedRecipe.categories, newCategory as RecipeCategory],
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setEditedRecipe({
      ...editedRecipe,
      categories: editedRecipe.categories.filter(cat => cat !== categoryToRemove),
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setEditedRecipe({
        ...editedRecipe,
        ingredients: [...editedRecipe.ingredients, newIngredient],
      });
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...editedRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    setEditedRecipe({
      ...editedRecipe,
      ingredients: updatedIngredients,
    });
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setEditedRecipe({
        ...editedRecipe,
        instructions: [...editedRecipe.instructions, newInstruction],
      });
      setNewInstruction("");
    }
  };

  const handleRemoveInstruction = (index: number) => {
    const updatedInstructions = [...editedRecipe.instructions];
    updatedInstructions.splice(index, 1);
    setEditedRecipe({
      ...editedRecipe,
      instructions: updatedInstructions,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setEditedRecipe({
          ...editedRecipe,
          image: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={editedRecipe.title}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editedRecipe.description}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                <input
                  type="number"
                  value={editedRecipe.prepTime}
                  onChange={(e) => setEditedRecipe({ ...editedRecipe, prepTime: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cook Time (min)</label>
                <input
                  type="number"
                  value={editedRecipe.cookTime}
                  onChange={(e) => setEditedRecipe({ ...editedRecipe, cookTime: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Servings</label>
                <input
                  type="number"
                  value={editedRecipe.servings}
                  onChange={(e) => setEditedRecipe({ ...editedRecipe, servings: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                  min={1}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex flex-col items-center space-y-2">
                {imagePreview ? (
                  <div className="relative w-full aspect-video">
                    <img
                      src={imagePreview}
                      alt={editedRecipe.title}
                      className="w-full h-full object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => {
                        setImagePreview(null);
                        setEditedRecipe({ ...editedRecipe, image: undefined });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 w-full flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categories</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editedRecipe.categories.map((category) => (
                  <div
                    key={category}
                    className="inline-flex items-center gap-1 bg-sage/20 text-sage rounded-full px-2 py-1"
                  >
                    <span className="text-xs">{category}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className="text-sage hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select a category</option>
                  {AVAILABLE_CATEGORIES.filter(
                    (cat) => !editedRecipe.categories.includes(cat)
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAddCategory} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ingredients</label>
              <ul className="space-y-2 mb-2">
                {editedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center justify-between p-2 border rounded">
                    <span>{ingredient}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-500 h-6 w-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient"
                  className="flex-1 p-2 border rounded"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                />
                <Button onClick={handleAddIngredient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instructions</label>
              <ol className="space-y-2 mb-2">
                {editedRecipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 border rounded">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">{instruction}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveInstruction(index)}
                      className="text-red-500 h-6 w-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ol>
              <div className="flex gap-2">
                <textarea
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="Add instruction"
                  className="flex-1 p-2 border rounded"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleAddInstruction();
                    }
                  }}
                />
                <Button onClick={handleAddInstruction} size="sm" className="self-start">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Press Ctrl+Enter to add instruction</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
