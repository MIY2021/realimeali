
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
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
      className={`p-2.5 rounded-[10px] border transition-all text-left relative hover:shadow-sm ${
        isSelected
          ? 'border-sage bg-sage/10 text-sage-dark'
          : 'border-[#E3E3E3] hover:border-sage/40 bg-white hover:bg-sage/5'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{option.icon}</span>
        <span className="text-xs sm:text-sm font-medium">{option.label}</span>
      </div>
      {isSelected && (
        <div className="absolute top-1 right-1">
          <div className="h-4 w-4 bg-sage text-white rounded-full flex items-center justify-center text-[10px] font-bold">
            ✓
          </div>
        </div>
      )}
    </button>
  );

  return (
    <Card className="rounded-[12px] border border-[#E3E3E3] shadow-sm bg-white">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="text-base font-semibold text-[#1A1A1A]">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Meal Type */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2 block">Meal Type (select all that apply)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
            {MEAL_TYPE_OPTIONS.map((option) => (
              <CategoryButton
                key={option.value}
                option={option}
                isSelected={(recipe.meal_types || []).includes(option.value)}
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
              />
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2 block">Cuisine (optional)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
            {CUISINE_REGION_OPTIONS.map((option) => (
              <CategoryButton
                key={option.value}
                option={option}
                isSelected={recipe.cuisine_region === option.value}
                onClick={() => updateRecipeField('cuisine_region', option.value)}
              />
            ))}
          </div>
        </div>

        {/* Diet & Lifestyle */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-[#1A1A1A] mb-2 block">Diet & Lifestyle (select multiple)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
            {DIET_LIFESTYLE_OPTIONS.map((option) => {
              const isSelected = (recipe.diet_lifestyle || []).includes(option.value as any);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleDietLifestyle(option.value)}
                  className={`p-2.5 rounded-[10px] border transition-all text-left relative hover:shadow-sm ${
                    isSelected
                      ? 'border-sage bg-sage/10 text-sage-dark'
                      : 'border-[#E3E3E3] hover:border-sage/40 bg-white hover:bg-sage/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{option.icon}</span>
                    <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <div className="h-4 w-4 bg-sage text-white rounded-full flex items-center justify-center text-[10px] font-bold">
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
