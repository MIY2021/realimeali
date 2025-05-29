
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, X } from "lucide-react";
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

  const addDietLifestyle = (diet: string) => {
    const currentDiets = recipe.diet_lifestyle || [];
    if (!currentDiets.includes(diet as any)) {
      updateRecipeField('diet_lifestyle', [...currentDiets, diet]);
    }
  };

  const removeDietLifestyle = (diet: string) => {
    const currentDiets = recipe.diet_lifestyle || [];
    updateRecipeField('diet_lifestyle', currentDiets.filter(d => d !== diet));
  };

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
            <Select onValueChange={addDietLifestyle}>
              <SelectTrigger>
                <SelectValue placeholder="Add diet/lifestyle tags" />
              </SelectTrigger>
              <SelectContent>
                {DIET_LIFESTYLE_OPTIONS.map((option) => (
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
        </div>

        {recipe.diet_lifestyle && recipe.diet_lifestyle.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Selected Diet & Lifestyle Tags</label>
            <div className="flex flex-wrap gap-2">
              {recipe.diet_lifestyle.map((diet) => {
                const option = DIET_LIFESTYLE_OPTIONS.find(opt => opt.value === diet);
                return (
                  <Badge key={diet} variant="secondary" className="flex items-center gap-1">
                    <span>{option?.icon}</span>
                    <span>{option?.label || diet}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeDietLifestyle(diet)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
