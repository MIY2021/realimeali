
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  MealType, 
  CuisineRegion, 
  CookingMethod, 
  DietLifestyle,
  ComplexityLevel,
  MainIngredient, 
  Recipe
} from "@/types";
import { Check } from "lucide-react";

interface SimpleCategorySelectorProps {
  recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
  onRecipeChange: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
}

// Define the options with icons and labels
const mealTypes: { value: MealType; label: string; icon: string }[] = [
  { value: "breakfast", label: "Breakfast", icon: "🍳" },
  { value: "lunch", label: "Lunch", icon: "🥪" },
  { value: "dinner", label: "Dinner", icon: "🍽️" },
  { value: "desserts", label: "Desserts", icon: "🍰" },
  { value: "drinks", label: "Drinks", icon: "🍹" },
  { value: "snacks", label: "Snacks", icon: "🍿" },
  { value: "sides", label: "Sides", icon: "🥗" },
];

const cuisineRegions: { value: CuisineRegion; label: string; icon: string }[] = [
  { value: "british", label: "British", icon: "🇬🇧" },
  { value: "american", label: "American", icon: "🇺🇸" },
  { value: "italian", label: "Italian", icon: "🇮🇹" },
  { value: "french", label: "French", icon: "🇫🇷" },
  { value: "mexican", label: "Mexican", icon: "🇲🇽" },
  { value: "indian", label: "Indian", icon: "🇮🇳" },
  { value: "chinese", label: "Chinese", icon: "🇨🇳" },
  { value: "japanese", label: "Japanese", icon: "🇯🇵" },
  { value: "thai", label: "Thai", icon: "🇹🇭" },
  { value: "mediterranean", label: "Mediterranean", icon: "🌊" },
  { value: "middle_eastern", label: "Middle Eastern", icon: "🕌" },
  { value: "african", label: "African", icon: "🌍" },
  { value: "korean", label: "Korean", icon: "🇰🇷" },
  { value: "caribbean", label: "Caribbean", icon: "🏝️" },
  { value: "nordic", label: "Nordic", icon: "❄️" },
  { value: "eastern_european", label: "Eastern European", icon: "🏰" },
];

const cookingMethods: { value: CookingMethod; label: string; icon: string }[] = [
  { value: "one_pot", label: "One Pot", icon: "🍲" },
  { value: "oven_baked", label: "Oven Baked", icon: "🔥" },
  { value: "air_fryer", label: "Air Fryer", icon: "🌀" },
  { value: "slow_cooker", label: "Slow Cooker", icon: "⏱️" },
  { value: "pressure_cooker", label: "Pressure Cooker", icon: "♨️" },
  { value: "bbq_grilled", label: "BBQ/Grilled", icon: "🔥" },
  { value: "stir_fried", label: "Stir Fried", icon: "🥢" },
  { value: "roasted", label: "Roasted", icon: "🍗" },
  { value: "raw_no_cook", label: "Raw/No Cook", icon: "🥗" },
];

const dietLifestyles: { value: DietLifestyle; label: string; icon: string }[] = [
  { value: "vegetarian", label: "Vegetarian", icon: "🥦" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "gluten_free", label: "Gluten Free", icon: "🌾" },
  { value: "dairy_free", label: "Dairy Free", icon: "🥛" },
  { value: "high_protein", label: "High Protein", icon: "💪" },
  { value: "kid_friendly", label: "Kid Friendly", icon: "👶" },
  { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
  { value: "low_carb_keto", label: "Low Carb/Keto", icon: "🥓" },
  { value: "paleo", label: "Paleo", icon: "🦴" },
  { value: "diabetic_friendly", label: "Diabetic Friendly", icon: "📉" },
  { value: "budget_meals", label: "Budget Meals", icon: "💰" },
  { value: "pregnancy_safe", label: "Pregnancy Safe", icon: "👶" },
];

const complexityLevels: { value: ComplexityLevel; label: string; icon: string }[] = [
  { value: "quick_easy", label: "Quick & Easy", icon: "⚡" },
  { value: "standard", label: "Standard", icon: "⭐" },
  { value: "complex", label: "Complex", icon: "👨‍🍳" },
];

const mainIngredients: { value: MainIngredient; label: string; icon: string }[] = [
  { value: "chicken", label: "Chicken", icon: "🍗" },
  { value: "beef", label: "Beef", icon: "🥩" },
  { value: "pork", label: "Pork", icon: "🥓" },
  { value: "lamb", label: "Lamb", icon: "🍖" },
  { value: "fish", label: "Fish", icon: "🐟" },
  { value: "tofu_tempeh", label: "Tofu/Tempeh", icon: "🧊" },
  { value: "eggs", label: "Eggs", icon: "🥚" },
  { value: "cheese", label: "Cheese", icon: "🧀" },
  { value: "pasta", label: "Pasta", icon: "🍝" },
  { value: "rice", label: "Rice", icon: "🍚" },
  { value: "lentils_beans", label: "Lentils/Beans", icon: "🫘" },
  { value: "vegetables", label: "Vegetables", icon: "🥦" },
  { value: "potatoes", label: "Potatoes", icon: "🥔" },
  { value: "fruit", label: "Fruit", icon: "🍎" },
  { value: "nuts_seeds", label: "Nuts/Seeds", icon: "🥜" },
  { value: "chocolate", label: "Chocolate", icon: "🍫" },
];

export function SimpleCategorySelector({ recipe, onRecipeChange }: SimpleCategorySelectorProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleMealTypeSelect = (mealType: MealType) => {
    onRecipeChange({ ...recipe, meal_type: mealType });
  };

  const handleCuisineSelect = (cuisine: CuisineRegion) => {
    onRecipeChange({ ...recipe, cuisine_region: cuisine });
  };

  const handleCookingMethodSelect = (method: CookingMethod) => {
    onRecipeChange({ ...recipe, cooking_method: method });
  };

  const handleDietToggle = (diet: DietLifestyle) => {
    const currentDiets = recipe.diet_lifestyle || [];
    const updatedDiets = currentDiets.includes(diet)
      ? currentDiets.filter(d => d !== diet)
      : [...currentDiets, diet];
    
    onRecipeChange({ ...recipe, diet_lifestyle: updatedDiets });
  };

  const handleComplexitySelect = (complexity: ComplexityLevel) => {
    onRecipeChange({ ...recipe, complexity_level: complexity });
  };

  const handleMainIngredientSelect = (ingredient: MainIngredient) => {
    onRecipeChange({ ...recipe, main_ingredient: ingredient });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipe Classification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Type */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Meal Type</Label>
          <div className="flex flex-wrap gap-2">
            {mealTypes.map((type) => (
              <Button
                key={type.value}
                type="button"
                variant={recipe.meal_type === type.value ? "default" : "outline"}
                className={`flex items-center gap-1 ${
                  recipe.meal_type === type.value ? "bg-blue-600 text-white" : ""
                }`}
                onClick={() => handleMealTypeSelect(type.value)}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Cuisine Region */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Cuisine</Label>
          <div className="flex flex-wrap gap-2">
            {cuisineRegions.slice(0, expandedSection === "cuisine" ? undefined : 8).map((cuisine) => (
              <Button
                key={cuisine.value}
                type="button"
                variant={recipe.cuisine_region === cuisine.value ? "default" : "outline"}
                className={`flex items-center gap-1 ${
                  recipe.cuisine_region === cuisine.value ? "bg-blue-600 text-white" : ""
                }`}
                onClick={() => handleCuisineSelect(cuisine.value)}
              >
                <span>{cuisine.icon}</span>
                <span>{cuisine.label}</span>
              </Button>
            ))}
            {cuisineRegions.length > 8 && (
              <Button
                variant="ghost"
                onClick={() => toggleSection("cuisine")}
                className="text-blue-600"
              >
                {expandedSection === "cuisine" ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>
        </div>

        {/* Cooking Method */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Cooking Method</Label>
          <div className="flex flex-wrap gap-2">
            {cookingMethods.map((method) => (
              <Button
                key={method.value}
                type="button"
                variant={recipe.cooking_method === method.value ? "default" : "outline"}
                className={`flex items-center gap-1 ${
                  recipe.cooking_method === method.value ? "bg-blue-600 text-white" : ""
                }`}
                onClick={() => handleCookingMethodSelect(method.value)}
              >
                <span>{method.icon}</span>
                <span>{method.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Dietary & Lifestyle */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Dietary & Lifestyle</Label>
          <div className="flex flex-wrap gap-2">
            {dietLifestyles.slice(0, expandedSection === "diet" ? undefined : 8).map((diet) => {
              const isSelected = (recipe.diet_lifestyle || []).includes(diet.value);
              return (
                <Button
                  key={diet.value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className={`flex items-center gap-1 ${
                    isSelected ? "bg-blue-600 text-white" : ""
                  }`}
                  onClick={() => handleDietToggle(diet.value)}
                >
                  <span>{diet.icon}</span>
                  <span>{diet.label}</span>
                  {isSelected && <Check className="w-4 h-4 ml-1" />}
                </Button>
              );
            })}
            {dietLifestyles.length > 8 && (
              <Button
                variant="ghost"
                onClick={() => toggleSection("diet")}
                className="text-blue-600"
              >
                {expandedSection === "diet" ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>
        </div>

        {/* Complexity Level - Changed to horizontal buttons instead of grid */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Complexity Level</Label>
          <div className="flex gap-2">
            {complexityLevels.map((level) => (
              <Button
                key={level.value}
                type="button"
                variant={recipe.complexity_level === level.value ? "default" : "outline"}
                className={`flex items-center gap-1 ${
                  recipe.complexity_level === level.value ? "bg-blue-600 text-white" : ""
                }`}
                onClick={() => handleComplexitySelect(level.value)}
              >
                <span>{level.icon}</span>
                <span>{level.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Ingredient */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Main Ingredient</Label>
          <div className="flex flex-wrap gap-2">
            {mainIngredients.slice(0, expandedSection === "ingredient" ? undefined : 8).map((ingredient) => (
              <Button
                key={ingredient.value}
                type="button"
                variant={recipe.main_ingredient === ingredient.value ? "default" : "outline"}
                className={`flex items-center gap-1 ${
                  recipe.main_ingredient === ingredient.value ? "bg-blue-600 text-white" : ""
                }`}
                onClick={() => handleMainIngredientSelect(ingredient.value)}
              >
                <span>{ingredient.icon}</span>
                <span>{ingredient.label}</span>
              </Button>
            ))}
            {mainIngredients.length > 8 && (
              <Button
                variant="ghost"
                onClick={() => toggleSection("ingredient")}
                className="text-blue-600"
              >
                {expandedSection === "ingredient" ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
