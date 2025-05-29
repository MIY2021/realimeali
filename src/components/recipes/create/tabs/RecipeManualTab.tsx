
import { Recipe } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Lightbulb, Clock, Users } from "lucide-react";
import { EnhancedIngredientManager } from "../EnhancedIngredientManager";
import { EnhancedInstructionManager } from "../EnhancedInstructionManager";
import { EnhancedImageUpload } from "../EnhancedImageUpload";
import { RecipeClassificationSelector } from "../RecipeClassificationSelector";

interface RecipeManualTabProps {
  isMobile: boolean;
  newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  imagePreview: string | null;
  isGeneratingImage: boolean;
  generationProgress: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
}

export function RecipeManualTab({
  isMobile,
  newRecipe,
  setNewRecipe,
  imagePreview,
  isGeneratingImage,
  generationProgress,
  onImageChange,
  onGenerateImage,
}: RecipeManualTabProps) {
  const handleIngredientsChange = (ingredients: string[]) => {
    setNewRecipe({ ...newRecipe, ingredients });
  };

  const handleInstructionsChange = (instructions: string[]) => {
    setNewRecipe({ ...newRecipe, instructions });
  };

  return (
    <div className="space-y-6">
      {/* Recipe Title & Description */}
      <Card className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title *
            </label>
            <Input
              value={newRecipe.title}
              onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
              placeholder="Enter a descriptive recipe title..."
              className="text-lg font-medium"
            />
            {!newRecipe.title.trim() && (
              <p className="text-xs text-red-500 mt-1">Recipe title is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={newRecipe.description}
              onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
              placeholder="Brief description of your recipe, what makes it special?"
              className="h-20 resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Recipe Details */}
      <Card className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recipe Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              Prep Time (minutes)
            </label>
            <Input
              type="number"
              value={newRecipe.prepTime || ''}
              onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) || 0 })}
              placeholder="15"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-orange-500" />
              Cook Time (minutes)
            </label>
            <Input
              type="number"
              value={newRecipe.cookTime || ''}
              onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: parseInt(e.target.value) || 0 })}
              placeholder="30"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-1 text-green-500" />
              Servings
            </label>
            <Input
              type="number"
              value={newRecipe.servings || ''}
              onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })}
              placeholder="4"
              min="1"
            />
          </div>
        </div>

        {(newRecipe.prepTime > 0 || newRecipe.cookTime > 0) && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>Total Time: </strong>
            {(newRecipe.prepTime || 0) + (newRecipe.cookTime || 0)} minutes
            {newRecipe.prepTime > 0 && newRecipe.cookTime > 0 && (
              <span className="ml-2">
                ({newRecipe.prepTime} prep + {newRecipe.cookTime} cook)
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Recipe Classification */}
      <RecipeClassificationSelector
        recipe={newRecipe}
        onRecipeChange={setNewRecipe}
      />

      {/* Ingredients */}
      <EnhancedIngredientManager
        ingredients={newRecipe.ingredients}
        onIngredientsChange={handleIngredientsChange}
      />

      {/* Instructions */}
      <EnhancedInstructionManager
        instructions={newRecipe.instructions}
        onInstructionsChange={handleInstructionsChange}
      />

      {/* Top Tip */}
      <Card className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Chef's Tip (Optional)
        </h3>
        <Textarea
          value={newRecipe.topTip || ""}
          onChange={(e) => setNewRecipe({ ...newRecipe, topTip: e.target.value })}
          placeholder="Share a helpful cooking tip, secret ingredient, or pro technique that makes this recipe special..."
          className="h-20 resize-none"
        />
        <p className="text-xs text-gray-500">
          💡 Add a pro tip, cooking secret, or helpful advice to make this recipe even better!
        </p>
      </Card>

      {/* Image Upload */}
      <EnhancedImageUpload
        imagePreview={imagePreview}
        isGeneratingImage={isGeneratingImage}
        generationProgress={generationProgress}
        onImageChange={onImageChange}
        onGenerateImage={onGenerateImage}
        recipeTitle={newRecipe.title}
      />
    </div>
  );
}
