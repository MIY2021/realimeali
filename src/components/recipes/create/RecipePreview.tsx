
import { Recipe } from "@/types";

interface RecipePreviewProps {
  recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
}

export function RecipePreview({ recipe }: RecipePreviewProps) {
  if (!recipe.title) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-green-600 font-medium">✓ Recipe Imported Successfully</span>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg text-gray-900">{recipe.title}</h3>
        {recipe.description && (
          <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Prep:</span>
          <div className="text-gray-600">{recipe.prepTime || 0} min</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Cook:</span>
          <div className="text-gray-600">{recipe.cookTime || 0} min</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Serves:</span>
          <div className="text-gray-600">{recipe.servings || 1}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Categories:</span>
          <div className="text-gray-600">{recipe.categories.length || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Ingredients:</span>
          <div className="text-gray-600">{recipe.ingredients.length} items</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Instructions:</span>
          <div className="text-gray-600">{recipe.instructions.length} steps</div>
        </div>
      </div>

      <div className="text-sm text-green-700 bg-green-100 rounded p-2">
        Recipe details have been extracted! Select an image below, then switch to the Manual Entry tab to review and edit.
      </div>
    </div>
  );
}
