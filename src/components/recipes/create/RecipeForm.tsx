
import React from "react";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EnhancedIngredientManager } from "./EnhancedIngredientManager";
import { EnhancedInstructionManager } from "./EnhancedInstructionManager";
import { RecipeClassificationSelector } from "./RecipeClassificationSelector";

interface RecipeFormProps {
  newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
  setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleIngredientsChange: (ingredients: string[]) => void;
  handleInstructionsChange: (instructions: string[]) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setShareWithCommunity: (share: boolean) => void;
  shareWithCommunity: boolean;
  handleShareRecipe: (recipeId: string, notes: string) => void;
}

export function RecipeForm({
  newRecipe,
  setNewRecipe,
  handleInputChange,
  handleIngredientsChange,
  handleInstructionsChange,
  handleSubmit,
  setShareWithCommunity,
  shareWithCommunity,
}: RecipeFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Recipe Title *</Label>
          <Input
            id="title"
            name="title"
            value={newRecipe.title}
            onChange={handleInputChange}
            placeholder="Enter recipe title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servings">Servings</Label>
          <Input
            id="servings"
            name="servings"
            type="number"
            value={newRecipe.servings}
            onChange={handleInputChange}
            min="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={newRecipe.description}
          onChange={handleInputChange}
          placeholder="Brief description of the recipe"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prep_time">Prep Time (minutes)</Label>
          <Input
            id="prep_time"
            name="prep_time"
            type="number"
            value={newRecipe.prep_time}
            onChange={handleInputChange}
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cook_time">Cook Time (minutes)</Label>
          <Input
            id="cook_time"
            name="cook_time"
            type="number"
            value={newRecipe.cook_time}
            onChange={handleInputChange}
            min="0"
          />
        </div>
      </div>

      <EnhancedIngredientManager
        ingredients={newRecipe.ingredients}
        onIngredientsChange={handleIngredientsChange}
      />

      <EnhancedInstructionManager
        instructions={newRecipe.instructions}
        onInstructionsChange={handleInstructionsChange}
      />

      <RecipeClassificationSelector
        recipe={newRecipe}
        onRecipeChange={setNewRecipe}
      />

      <div className="space-y-2">
        <Label htmlFor="top_tip">Top Tip</Label>
        <Textarea
          id="top_tip"
          name="top_tip"
          value={newRecipe.top_tip}
          onChange={handleInputChange}
          placeholder="Share a helpful tip for making this recipe"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="share_community"
          checked={shareWithCommunity}
          onCheckedChange={setShareWithCommunity}
        />
        <Label htmlFor="share_community">Share with community</Label>
      </div>

      <Button type="submit" className="w-full">
        Create Recipe
      </Button>
    </form>
  );
}
