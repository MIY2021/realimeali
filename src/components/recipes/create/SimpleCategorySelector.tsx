
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, X } from "lucide-react";
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
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
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
      className={`p-3 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'border-terracotta bg-terracotta/10 text-terracotta font-medium'
          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{option.icon}</span>
        <span className="text-sm">{option.label}</span>
      </div>
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-sage" />
          Recipe Classification
        </CardTitle>
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
                isSelected={recipe.cuisine === option.value}
                onClick={() => updateRecipeField('cuisine', option.value)}
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
              const isSelected = (recipe.diet_lifestyle || []).includes(option.value);
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
                      <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                        ✓
                      </Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Show selected tags */}
          {recipe.diet_lifestyle && recipe.diet_lifestyle.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recipe.diet_lifestyle.map((value) => {
                const option = DIET_LIFESTYLE_OPTIONS.find(opt => opt.value === value);
                return option ? (
                  <Badge key={value} variant="secondary" className="flex items-center gap-1">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleDietLifestyle(value)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
