import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RecipeCategory } from "@/types";

interface ParsedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  categories: RecipeCategory[];
  prepTime: number;
  cookTime: number;
  servings: number;
}

interface RecipeAmendmentProps {
  recipe: ParsedRecipe;
  availableCategories: RecipeCategory[];
  onSave: (amendedRecipe: ParsedRecipe) => void;
  onCancel: () => void;
}

export function RecipeAmendment({
  recipe,
  availableCategories,
  onSave,
  onCancel
}: RecipeAmendmentProps) {
  const [editedRecipe, setEditedRecipe] = useState<ParsedRecipe>(recipe);

  const updateRecipe = (field: keyof ParsedRecipe, value: any) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = value;
    updateRecipe('ingredients', newIngredients);
  };

  const addIngredient = () => {
    updateRecipe('ingredients', [...editedRecipe.ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = editedRecipe.ingredients.filter((_, i) => i !== index);
    updateRecipe('ingredients', newIngredients);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...editedRecipe.instructions];
    newInstructions[index] = value;
    updateRecipe('instructions', newInstructions);
  };

  const addInstruction = () => {
    updateRecipe('instructions', [...editedRecipe.instructions, '']);
  };

  const removeInstruction = (index: number) => {
    const newInstructions = editedRecipe.instructions.filter((_, i) => i !== index);
    updateRecipe('instructions', newInstructions);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Edit Recipe Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedRecipe.title}
              onChange={(e) => updateRecipe('title', e.target.value)}
              autoFocus={false}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedRecipe.description}
              onChange={(e) => updateRecipe('description', e.target.value)}
              rows={3}
              autoFocus={false}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="prepTime">Prep Time (min)</Label>
              <Input
                id="prepTime"
                type="number"
                value={editedRecipe.prepTime}
                onChange={(e) => updateRecipe('prepTime', Number(e.target.value))}
                min={0}
                autoFocus={false}
              />
            </div>
            <div>
              <Label htmlFor="cookTime">Cook Time (min)</Label>
              <Input
                id="cookTime"
                type="number"
                value={editedRecipe.cookTime}
                onChange={(e) => updateRecipe('cookTime', Number(e.target.value))}
                min={0}
                autoFocus={false}
              />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={editedRecipe.servings}
                onChange={(e) => updateRecipe('servings', Number(e.target.value))}
                min={1}
                autoFocus={false}
              />
            </div>
          </div>

          <div>
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {editedRecipe.categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 bg-sage/20 text-sage rounded-full px-2 py-1 text-xs cursor-pointer hover:bg-red-100"
                  onClick={() => updateRecipe('categories', editedRecipe.categories.filter(c => c !== category))}
                >
                  {category} ×
                </span>
              ))}
            </div>
            <select
              onChange={(e) => {
                const category = e.target.value as RecipeCategory;
                if (category && !editedRecipe.categories.includes(category)) {
                  updateRecipe('categories', [...editedRecipe.categories, category]);
                }
              }}
              value=""
              className="w-full p-2 border rounded"
              autoFocus={false}
            >
              <option value="">Add category...</option>
              {availableCategories.filter(cat => !editedRecipe.categories.includes(cat)).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Ingredients ({editedRecipe.ingredients.length})</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder="Enter ingredient..."
                    className="flex-1"
                    autoFocus={false}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addIngredient}
                className="w-full"
              >
                Add Ingredient
              </Button>
            </div>
          </div>

          <div>
            <Label>Instructions ({editedRecipe.instructions.length} steps)</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {editedRecipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-sm font-medium text-sage mt-2 min-w-[20px]">{index + 1}.</span>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder="Enter instruction..."
                    className="flex-1"
                    rows={2}
                    autoFocus={false}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    className="text-red-600 hover:text-red-700 mt-2"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addInstruction}
                className="w-full"
              >
                Add Instruction
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(editedRecipe)}
          style={{ backgroundColor: '#e38165' }}
          className="hover:opacity-90 text-white"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
