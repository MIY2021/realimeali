
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { UtensilsCrossed } from "lucide-react";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
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
            <Select 
              value={recipe.meal_type || ""} 
              onValueChange={(value) => updateRecipeField('meal_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPE_OPTIONS.map((option) => (
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
            <label className="text-sm font-medium mb-2 block">Cuisine</label>
            <Select 
              value={recipe.cuisine || ""} 
              onValueChange={(value) => updateRecipeField('cuisine', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                {CUISINE_OPTIONS.map((option) => (
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
            <label className="text-sm font-medium mb-2 block">Complexity Level</label>
            <Select 
              value={recipe.complexity_level || ""} 
              onValueChange={(value) => updateRecipeField('complexity_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                {COMPLEXITY_LEVEL_OPTIONS.map((option) => (
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
