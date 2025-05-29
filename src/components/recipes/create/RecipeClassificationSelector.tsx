
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recipe, MealType, CuisineRegion, CookingMethod, DietLifestyle, ComplexityLevel, MainIngredient } from "@/types";
import { MEAL_TYPE_OPTIONS, CUISINE_REGION_OPTIONS, COOKING_METHOD_OPTIONS, DIET_LIFESTYLE_OPTIONS, COMPLEXITY_LEVEL_OPTIONS, MAIN_INGREDIENT_OPTIONS } from "@/utils/recipeClassification";
import { Tags } from "lucide-react";

interface RecipeClassificationSelectorProps {
  recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  onRecipeChange: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export function RecipeClassificationSelector({ recipe, onRecipeChange }: RecipeClassificationSelectorProps) {
  const handleDietLifestyleChange = (lifestyle: DietLifestyle, checked: boolean) => {
    const current = recipe.dietLifestyle || [];
    const updated = checked 
      ? [...current, lifestyle]
      : current.filter(item => item !== lifestyle);
    onRecipeChange({ ...recipe, dietLifestyle: updated });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Tags className="h-5 w-5 mr-2 text-blue-500" />
          Recipe Classification
        </h3>
        <Badge variant="secondary" className="bg-purple-50 text-purple-700">
          Optional but recommended
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
          <select
            value={recipe.mealType || ''}
            onChange={(e) => onRecipeChange({ ...recipe, mealType: (e.target.value || undefined) as MealType })}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select meal type...</option>
            {MEAL_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Cuisine Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
          <select
            value={recipe.cuisineRegion || ''}
            onChange={(e) => onRecipeChange({ ...recipe, cuisineRegion: (e.target.value || undefined) as CuisineRegion })}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select cuisine...</option>
            {CUISINE_REGION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Cooking Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Method</label>
          <select
            value={recipe.cookingMethod || ''}
            onChange={(e) => onRecipeChange({ ...recipe, cookingMethod: (e.target.value || undefined) as CookingMethod })}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select method...</option>
            {COOKING_METHOD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Complexity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complexity</label>
          <select
            value={recipe.complexityLevel || ''}
            onChange={(e) => onRecipeChange({ ...recipe, complexityLevel: (e.target.value || undefined) as ComplexityLevel })}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select complexity...</option>
            {COMPLEXITY_LEVEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Main Ingredient */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Ingredient</label>
          <select
            value={recipe.mainIngredient || ''}
            onChange={(e) => onRecipeChange({ ...recipe, mainIngredient: (e.target.value || undefined) as MainIngredient })}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select main ingredient...</option>
            {MAIN_INGREDIENT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Diet & Lifestyle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Diet & Lifestyle</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {DIET_LIFESTYLE_OPTIONS.map(option => (
            <label key={option.value} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={(recipe.dietLifestyle || []).includes(option.value)}
                onChange={(e) => handleDietLifestyleChange(option.value, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        💡 Tip: Classifications help users find your recipes and get better recommendations.
      </p>
    </Card>
  );
}
