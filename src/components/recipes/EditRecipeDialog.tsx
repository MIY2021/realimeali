
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Lightbulb, Clock, Users } from "lucide-react";
import { Recipe, MealType, CuisineRegion, CookingMethod, DietLifestyle, ComplexityLevel, MainIngredient } from "@/types";
import { MEAL_TYPE_OPTIONS, CUISINE_REGION_OPTIONS, COOKING_METHOD_OPTIONS, DIET_LIFESTYLE_OPTIONS, COMPLEXITY_LEVEL_OPTIONS, MAIN_INGREDIENT_OPTIONS } from "@/utils/recipeClassification";

interface EditRecipeDialogProps {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Recipe) => void;
}

export function EditRecipeDialog({ recipe, open, onOpenChange, onSave }: EditRecipeDialogProps) {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
  const [newIngredient, setNewIngredient] = useState("");
  const [newInstruction, setNewInstruction] = useState("");

  useEffect(() => {
    setEditedRecipe(recipe);
  }, [recipe]);

  const updateRecipe = (field: keyof Recipe, value: any) => {
    setEditedRecipe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      updateRecipe('ingredients', [...editedRecipe.ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    const newIngredients = editedRecipe.ingredients.filter((_, i) => i !== index);
    updateRecipe('ingredients', newIngredients);
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      updateRecipe('instructions', [...editedRecipe.instructions, newInstruction.trim()]);
      setNewInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    const newInstructions = editedRecipe.instructions.filter((_, i) => i !== index);
    updateRecipe('instructions', newInstructions);
  };

  const handleDietLifestyleChange = (lifestyle: DietLifestyle, checked: boolean) => {
    const current = editedRecipe.dietLifestyle || [];
    if (checked) {
      updateRecipe('dietLifestyle', [...current, lifestyle]);
    } else {
      updateRecipe('dietLifestyle', current.filter(item => item !== lifestyle));
    }
  };

  const handleSave = () => {
    onSave(editedRecipe);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Recipe Title</Label>
                <Input
                  id="title"
                  value={editedRecipe.title}
                  onChange={(e) => updateRecipe('title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedRecipe.description}
                  onChange={(e) => updateRecipe('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="prepTime">Prep Time (min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={editedRecipe.prepTime}
                    onChange={(e) => updateRecipe('prepTime', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Cook Time (min)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={editedRecipe.cookTime}
                    onChange={(e) => updateRecipe('cookTime', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={editedRecipe.servings}
                    onChange={(e) => updateRecipe('servings', parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="mealType">Meal Type</Label>
                <select
                  id="mealType"
                  value={editedRecipe.mealType || ""}
                  onChange={(e) => updateRecipe('mealType', e.target.value as MealType || undefined)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select meal type...</option>
                  {MEAL_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="cuisineRegion">Cuisine</Label>
                <select
                  id="cuisineRegion"
                  value={editedRecipe.cuisineRegion || ""}
                  onChange={(e) => updateRecipe('cuisineRegion', e.target.value as CuisineRegion || undefined)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select cuisine...</option>
                  {CUISINE_REGION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="cookingMethod">Cooking Method</Label>
                <select
                  id="cookingMethod"
                  value={editedRecipe.cookingMethod || ""}
                  onChange={(e) => updateRecipe('cookingMethod', e.target.value as CookingMethod || undefined)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select cooking method...</option>
                  {COOKING_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="complexityLevel">Complexity</Label>
                <select
                  id="complexityLevel"
                  value={editedRecipe.complexityLevel || ""}
                  onChange={(e) => updateRecipe('complexityLevel', e.target.value as ComplexityLevel || undefined)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select complexity...</option>
                  {COMPLEXITY_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="mainIngredient">Main Ingredient</Label>
                <select
                  id="mainIngredient"
                  value={editedRecipe.mainIngredient || ""}
                  onChange={(e) => updateRecipe('mainIngredient', e.target.value as MainIngredient || undefined)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select main ingredient...</option>
                  {MAIN_INGREDIENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Diet & Lifestyle */}
          <div>
            <Label>Diet & Lifestyle</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {DIET_LIFESTYLE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(editedRecipe.dietLifestyle || []).includes(option.value)}
                    onChange={(e) => handleDietLifestyleChange(option.value, e.target.checked)}
                    className="rounded"
                  />
                  <span>{option.icon} {option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <Label>Ingredients</Label>
            <div className="space-y-2 mt-2">
              {editedRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => {
                      const newIngredients = [...editedRecipe.ingredients];
                      newIngredients[index] = e.target.value;
                      updateRecipe('ingredients', newIngredients);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                />
                <Button onClick={addIngredient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Label>Instructions</Label>
            <div className="space-y-2 mt-2">
              {editedRecipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-sm font-medium text-sage mt-2 min-w-[20px]">{index + 1}.</span>
                  <Textarea
                    value={instruction}
                    onChange={(e) => {
                      const newInstructions = [...editedRecipe.instructions];
                      newInstructions[index] = e.target.value;
                      updateRecipe('instructions', newInstructions);
                    }}
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    className="text-red-600 hover:text-red-700 mt-2"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="Add instruction..."
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={addInstruction} size="sm" className="mt-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Top Tip */}
          <div>
            <Label htmlFor="topTip" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Chef's Tip
            </Label>
            <Textarea
              id="topTip"
              value={editedRecipe.topTip || ""}
              onChange={(e) => updateRecipe('topTip', e.target.value)}
              placeholder="Share a helpful cooking tip..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-terracotta hover:bg-terracotta/90">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
