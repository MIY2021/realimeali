
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
} from "@/utils/recipeClassification";

interface SimpleCategorySelectorProps {
  recipe: Recipe | Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by">;
  onRecipeChange: (recipe: Recipe | Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by">) => void;
}

export function SimpleCategorySelector({ recipe, onRecipeChange }: SimpleCategorySelectorProps) {
  const updateRecipeField = (field: keyof Recipe, value: any) => {
    onRecipeChange({ ...recipe, [field]: value });
  };

  const toggleDietLifestyle = (value: string) => {
    const current = recipe.diet_lifestyle || [];
    const updated = current.includes(value as any)
      ? current.filter(item => item !== value)
      : [...current, value as any];
    updateRecipeField('diet_lifestyle', updated);
  };

  const CategoryButton = ({ 
    option, 
    isSelected, 
    onClick 
  }: { 
    option: { value: string; label: string; icon: string }; 
    isSelected: boolean; 
    onClick: () => void; 
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all text-left relative ${
        isSelected
          ? 'border-green-500 bg-green-50 text-green-700'
          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{option.icon}</span>
        <span className="text-sm">{option.label}</span>
      </div>
      {isSelected && (
        <div className="absolute top-1 right-1">
          <div className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            ✓
          </div>
        </div>
      )}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meal Type */}
        <div>
          <label className="text-sm font-medium mb-3 block">Meal Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {MEAL_TYPE_OPTIONS.map((option) => (
              <CategoryButton
                key={option.value}
                option={option}
                isSelected={recipe.meal_type === option.value}
                onClick={() => updateRecipeField('meal_type', option.value)}
              />
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="text-sm font-medium mb-3 block">Cuisine</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {CUISINE_OPTIONS.map((option) => (
              <CategoryButton
                key={option.value}
                option={option}
                isSelected={recipe.cuisine_region === option.value}
                onClick={() => updateRecipeField('cuisine_region', option.value)}
              />
            ))}
          </div>
        </div>

        {/* Complexity Level */}
        <div>
          <label className="text-sm font-medium mb-3 block">Complexity Level</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {COMPLEXITY_LEVEL_OPTIONS.map((option) => (
              <CategoryButton
                key={option.value}
                option={option}
                isSelected={recipe.complexity_level === option.value}
                onClick={() => updateRecipeField('complexity_level', option.value)}
              />
            ))}
          </div>
        </div>

        {/* Diet & Lifestyle */}
        <div>
          <label className="text-sm font-medium mb-3 block">Diet & Lifestyle (select multiple)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {DIET_LIFESTYLE_OPTIONS.map((option) => {
              const isSelected = (recipe.diet_lifestyle || []).includes(option.value as any);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleDietLifestyle(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                    isSelected
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <div className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
