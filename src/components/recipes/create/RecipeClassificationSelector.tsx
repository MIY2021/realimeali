
import { Recipe } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat } from "lucide-react";

interface RecipeClassificationSelectorProps {
  recipe: Recipe | Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  onRecipeChange: (recipe: Recipe | Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
];

const CUISINE_REGIONS = [
  { value: "italian", label: "Italian" },
  { value: "mexican", label: "Mexican" },
  { value: "asian", label: "Asian" },
  { value: "american", label: "American" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "indian", label: "Indian" },
  { value: "french", label: "French" },
  { value: "thai", label: "Thai" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
];

const COOKING_METHODS = [
  { value: "grilled", label: "Grilled" },
  { value: "baked", label: "Baked" },
  { value: "fried", label: "Fried" },
  { value: "steamed", label: "Steamed" },
  { value: "roasted", label: "Roasted" },
  { value: "sauteed", label: "Sautéed" },
  { value: "boiled", label: "Boiled" },
  { value: "slow_cooked", label: "Slow Cooked" },
  { value: "no_cook", label: "No Cook" },
];

const COMPLEXITY_LEVELS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const MAIN_INGREDIENTS = [
  { value: "chicken", label: "Chicken" },
  { value: "beef", label: "Beef" },
  { value: "pork", label: "Pork" },
  { value: "fish", label: "Fish" },
  { value: "seafood", label: "Seafood" },
  { value: "vegetables", label: "Vegetables" },
  { value: "pasta", label: "Pasta" },
  { value: "rice", label: "Rice" },
  { value: "beans", label: "Beans" },
  { value: "eggs", label: "Eggs" },
];

const DIET_LIFESTYLES = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten Free" },
  { value: "dairy_free", label: "Dairy Free" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "low_carb", label: "Low Carb" },
  { value: "high_protein", label: "High Protein" },
];

export function RecipeClassificationSelector({ recipe, onRecipeChange }: RecipeClassificationSelectorProps) {
  const handleSelectChange = (field: keyof Recipe, value: string) => {
    onRecipeChange({ ...recipe, [field]: value });
  };

  const handleDietLifestyleChange = (diet: string, checked: boolean) => {
    const currentDiets = recipe.dietLifestyle || [];
    const updatedDiets = checked
      ? [...currentDiets, diet]
      : currentDiets.filter(d => d !== diet);
    
    onRecipeChange({ ...recipe, dietLifestyle: updatedDiets });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ChefHat className="h-5 w-5 text-sage" />
        <h3 className="text-lg font-semibold">Recipe Classification</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mealType">Meal Type</Label>
          <Select value={recipe.mealType || ""} onValueChange={(value) => handleSelectChange("mealType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              {MEAL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cuisineRegion">Cuisine Region</Label>
          <Select value={recipe.cuisineRegion || ""} onValueChange={(value) => handleSelectChange("cuisineRegion", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select cuisine" />
            </SelectTrigger>
            <SelectContent>
              {CUISINE_REGIONS.map((cuisine) => (
                <SelectItem key={cuisine.value} value={cuisine.value}>
                  {cuisine.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cookingMethod">Cooking Method</Label>
          <Select value={recipe.cookingMethod || ""} onValueChange={(value) => handleSelectChange("cookingMethod", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select cooking method" />
            </SelectTrigger>
            <SelectContent>
              {COOKING_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="complexityLevel">Complexity Level</Label>
          <Select value={recipe.complexityLevel || ""} onValueChange={(value) => handleSelectChange("complexityLevel", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select complexity" />
            </SelectTrigger>
            <SelectContent>
              {COMPLEXITY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="mainIngredient">Main Ingredient</Label>
          <Select value={recipe.mainIngredient || ""} onValueChange={(value) => handleSelectChange("mainIngredient", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select main ingredient" />
            </SelectTrigger>
            <SelectContent>
              {MAIN_INGREDIENTS.map((ingredient) => (
                <SelectItem key={ingredient.value} value={ingredient.value}>
                  {ingredient.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Diet & Lifestyle</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {DIET_LIFESTYLES.map((diet) => (
            <div key={diet.value} className="flex items-center space-x-2">
              <Checkbox
                id={diet.value}
                checked={recipe.dietLifestyle?.includes(diet.value) || false}
                onCheckedChange={(checked) => handleDietLifestyleChange(diet.value, !!checked)}
              />
              <Label htmlFor={diet.value} className="text-sm">
                {diet.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
