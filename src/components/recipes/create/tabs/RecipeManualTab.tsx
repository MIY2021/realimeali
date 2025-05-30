
import { Recipe } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";
import { EnhancedIngredientManager } from "../EnhancedIngredientManager";
import { EnhancedInstructionManager } from "../EnhancedInstructionManager";
import { EnhancedImageUpload } from "../EnhancedImageUpload";
import { RecipeClassificationSelector } from "../RecipeClassificationSelector";

interface RecipeManualTabProps {
  isMobile: boolean;
  newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
  setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  newCategory: string;
  setNewCategory: (category: string) => void;
  newIngredient: string;
  setNewIngredient: (ingredient: string) => void;
  newInstruction: string;
  setNewInstruction: (instruction: string) => void;
  imagePreview: string | null;
  isGeneratingImage: boolean;
  generationProgress: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (ingredient: string) => void;
  onAddInstruction: () => void;
  onRemoveInstruction: (instruction: string) => void;
}

export function RecipeManualTab({
  isMobile,
  newRecipe,
  setNewRecipe,
  newCategory,
  setNewCategory,
  newIngredient,
  setNewIngredient,
  newInstruction,
  setNewInstruction,
  imagePreview,
  isGeneratingImage,
  generationProgress,
  onImageChange,
  onGenerateImage,
  onAddCategory,
  onRemoveCategory,
  onAddIngredient,
  onRemoveIngredient,
  onAddInstruction,
  onRemoveInstruction,
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
              value={newRecipe.prep_time || ''}
              onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: parseInt(e.target.value) || 0 })}
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
              value={newRecipe.cook_time || ''}
              onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: parseInt(e.target.value) || 0 })}
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

        {(newRecipe.prep_time > 0 || newRecipe.cook_time > 0) && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>Total Time: </strong>
            {(newRecipe.prep_time || 0) + (newRecipe.cook_time || 0)} minutes
            {newRecipe.prep_time > 0 && newRecipe.cook_time > 0 && (
              <span className="ml-2">
                ({newRecipe.prep_time} prep + {newRecipe.cook_time} cook)
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
