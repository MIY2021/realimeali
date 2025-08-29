
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { UtensilsCrossed } from "lucide-react";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
} from "@/utils/recipeClassification";

interface RecipeClassificationSelectorProps {
  recipe: Recipe | Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by">;
  onRecipeChange: (recipe: Recipe | Omit<Recipe, "id" | "created_at" | "updated_at" | "created_by">) => void;
}

export function RecipeClassificationSelector({ recipe, onRecipeChange }: RecipeClassificationSelectorProps) {
  const updateRecipeField = (field: keyof Recipe, value: any) => {
    onRecipeChange({ ...recipe, [field]: value });
  };

  const handleDietLifestyleChange = (selectedValues: string[]) => {
    updateRecipeField('diet_lifestyle', selectedValues);
  };

  // Convert diet lifestyle options to the format expected by MultiSelect
  const dietLifestyleOptions = DIET_LIFESTYLE_OPTIONS.map(option => ({
    label: `${option.icon} ${option.label}`,
    value: option.value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-sage" />
          Recipe Classification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Meal Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {MEAL_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const currentTypes = recipe.meal_types || [];
                    const isSelected = currentTypes.includes(option.value);
                    
                    if (isSelected) {
                      // Remove if already selected
                      const newTypes = currentTypes.filter(type => type !== option.value);
                      updateRecipeField('meal_types', newTypes);
                    } else {
                      // Add if not selected
                      const newTypes = [...currentTypes, option.value];
                      updateRecipeField('meal_types', newTypes);
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                    (recipe.meal_types || []).includes(option.value)
                      ? 'border-sage bg-sage/10 text-sage-dark'
                      : 'border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {(recipe.meal_types || []).includes(option.value) && (
                    <div className="absolute top-1 right-1">
                      <div className="h-5 w-5 bg-sage text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cuisine (optional)</label>
            <Select 
              value={recipe.cuisine_region || ""} 
              onValueChange={(value) => updateRecipeField('cuisine_region', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                {CUISINE_REGION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Diet & Lifestyle</label>
            <MultiSelect
              options={dietLifestyleOptions}
              selected={recipe.diet_lifestyle || []}
              onChange={handleDietLifestyleChange}
              placeholder="Select diet/lifestyle tags"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
