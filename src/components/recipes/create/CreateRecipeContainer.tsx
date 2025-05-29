
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { CreateRecipeHeader } from "./CreateRecipeHeader";
import { CreateRecipeActions } from "./CreateRecipeActions";
import { Recipe } from "@/types";

export function CreateRecipeContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { createRecipe } = useRecipes();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>({
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    isFavorite: false,
    householdId: currentHousehold?.id || '',
    topTip: ''
  });

  const handleSaveRecipe = async () => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "You must be logged in and have a household to save recipes",
        variant: "destructive",
      });
      return;
    }

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

    setIsSaving(true);
    try {
      const savedRecipe = await createRecipe(newRecipe, currentHousehold.id);
      
      if (savedRecipe) {
        toast({
          title: "Success",
          description: "Recipe saved successfully!",
        });
        navigate("/my-recipes");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = !!(newRecipe.title.trim() && newRecipe.ingredients.length > 0 && newRecipe.instructions.length > 0);

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 space-y-6">
      <CreateRecipeHeader />
      
      {/* Simple recipe form */}
      <div className="space-y-6 bg-white p-6 rounded-lg border">
        <div>
          <label className="block text-sm font-medium mb-2">Recipe Title</label>
          <input
            type="text"
            value={newRecipe.title}
            onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Enter recipe title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={newRecipe.description}
            onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
            className="w-full p-2 border rounded h-24"
            placeholder="Brief description of the recipe..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prep Time (min)</label>
            <input
              type="number"
              value={newRecipe.prepTime}
              onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cook Time (min)</label>
            <input
              type="number"
              value={newRecipe.cookTime}
              onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Servings</label>
            <input
              type="number"
              value={newRecipe.servings}
              onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ingredients</label>
          <p className="text-sm text-gray-600 mb-2">Add at least one ingredient to continue</p>
          <div className="space-y-2">
            {newRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => {
                    const updated = [...newRecipe.ingredients];
                    updated[index] = e.target.value;
                    setNewRecipe({ ...newRecipe, ingredients: updated });
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={() => {
                    const updated = newRecipe.ingredients.filter((_, i) => i !== index);
                    setNewRecipe({ ...newRecipe, ingredients: updated });
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => setNewRecipe({ ...newRecipe, ingredients: [...newRecipe.ingredients, ''] })}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Ingredient
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Instructions</label>
          <p className="text-sm text-gray-600 mb-2">Add at least one instruction to continue</p>
          <div className="space-y-2">
            {newRecipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  value={instruction}
                  onChange={(e) => {
                    const updated = [...newRecipe.instructions];
                    updated[index] = e.target.value;
                    setNewRecipe({ ...newRecipe, instructions: updated });
                  }}
                  className="flex-1 p-2 border rounded h-20"
                  placeholder={`Step ${index + 1}...`}
                />
                <button
                  onClick={() => {
                    const updated = newRecipe.instructions.filter((_, i) => i !== index);
                    setNewRecipe({ ...newRecipe, instructions: updated });
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => setNewRecipe({ ...newRecipe, instructions: [...newRecipe.instructions, ''] })}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Instruction
            </button>
          </div>
        </div>
      </div>

      <CreateRecipeActions
        onSave={handleSaveRecipe}
        onCancel={() => navigate("/my-recipes")}
        isSaving={isSaving}
        isValid={isValid}
      />
    </div>
  );
}
