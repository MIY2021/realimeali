
import { useState } from "react";
import { Recipe, RecipeCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, X } from "lucide-react";

interface CreateRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

// List of available categories
const AVAILABLE_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish",
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ",
  "Faffy", "Pricey", "Not-Yet-Made", "Snacks", "Breakfast"
];

export function CreateRecipeDialog({ open, onOpenChange, onSave }: CreateRecipeDialogProps) {
  const { toast } = useToast();
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    categories: [],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    image: undefined,
    isFavorite: false,
  });
  const [newCategory, setNewCategory] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipeText, setRecipeText] = useState("");

  const resetForm = () => {
    setNewRecipe({
      title: "",
      description: "",
      ingredients: [],
      instructions: [],
      categories: [],
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      image: undefined,
      isFavorite: false,
    });
    setNewCategory("");
    setNewIngredient("");
    setNewInstruction("");
    setImagePreview(null);
    setRecipeText("");
  };

  const handleSave = () => {
    // Basic validation
    if (!newRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required",
        variant: "destructive",
      });
      return;
    }

    if (newRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    if (newRecipe.instructions.length === 0) {
      toast({
        title: "Error",
        description: "At least one instruction is required",
        variant: "destructive",
      });
      return;
    }

    onSave(newRecipe);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !newRecipe.categories.includes(newCategory as RecipeCategory)) {
      setNewRecipe({
        ...newRecipe,
        categories: [...newRecipe.categories, newCategory as RecipeCategory],
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setNewRecipe({
      ...newRecipe,
      categories: newRecipe.categories.filter(cat => cat !== categoryToRemove),
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...newRecipe.ingredients, newIngredient],
      });
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients,
    });
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setNewRecipe({
        ...newRecipe,
        instructions: [...newRecipe.instructions, newInstruction],
      });
      setNewInstruction("");
    }
  };

  const handleRemoveInstruction = (index: number) => {
    const updatedInstructions = [...newRecipe.instructions];
    updatedInstructions.splice(index, 1);
    setNewRecipe({
      ...newRecipe,
      instructions: updatedInstructions,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setNewRecipe({
          ...newRecipe,
          image: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Recipe</DialogTitle>
          <p className="text-muted-foreground">
            Add recipes to your recipe collection from a variety of sources and methods
          </p>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="text">Recipe Text</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="image">From Image</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Manual Entry</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your recipe details manually using the form below
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                    <input
                      type="number"
                      value={newRecipe.prepTime}
                      onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: Number(e.target.value) })}
                      className="w-full p-2 border rounded"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cook Time (min)</label>
                    <input
                      type="number"
                      value={newRecipe.cookTime}
                      onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: Number(e.target.value) })}
                      className="w-full p-2 border rounded"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Servings</label>
                    <input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({ ...newRecipe, servings: Number(e.target.value) })}
                      className="w-full p-2 border rounded"
                      min={1}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categories</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newRecipe.categories.map((category) => (
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
                        (cat) => !newRecipe.categories.includes(cat)
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
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ingredients</label>
                  <ul className="space-y-2 mb-2">
                    {newRecipe.ingredients.map((ingredient, index) => (
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
                    {newRecipe.instructions.map((instruction, index) => (
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

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Create Recipe</Button>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Recipe Text</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Paste or type a recipe and our AI will extract the ingredients and instructions
              </p>
            </div>
            <textarea
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Paste your recipe text here..."
              className="w-full p-3 border rounded-md"
              rows={12}
            />
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">From URL</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a URL from a recipe website and we'll extract the recipe information
              </p>
            </div>
            <input
              type="url"
              placeholder="https://example.com/recipe"
              className="w-full p-3 border rounded-md"
            />
          </TabsContent>

          <TabsContent value="image" className="space-y-4 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">From Image</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload an image of a recipe and our AI will extract the text and ingredients
              </p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
