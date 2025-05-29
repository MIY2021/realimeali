
import { 
  MealType, 
  CuisineRegion, 
  CookingMethod, 
  DietLifestyle, 
  ComplexityLevel, 
  MainIngredient 
} from "@/types";

// Classification options with display labels
export const MEAL_TYPE_OPTIONS: { value: MealType; label: string; icon: string }[] = [
  { value: "breakfast", label: "Breakfast", icon: "🍳" },
  { value: "lunch", label: "Lunch", icon: "🥗" },
  { value: "dinner", label: "Dinner", icon: "🍽️" },
  { value: "snacks", label: "Snacks", icon: "🍿" },
  { value: "sides", label: "Sides", icon: "🥖" },
  { value: "desserts", label: "Desserts", icon: "🍰" },
  { value: "drinks", label: "Drinks", icon: "🥤" },
  { value: "sauces_dips", label: "Sauces & Dips", icon: "🫙" },
  { value: "soups_stews", label: "Soups & Stews", icon: "🍲" },
  { value: "salads", label: "Salads", icon: "🥗" },
  { value: "baking_breads", label: "Baking & Breads", icon: "🍞" },
];

export const CUISINE_REGION_OPTIONS: { value: CuisineRegion; label: string; icon: string }[] = [
  { value: "british", label: "British", icon: "🇬🇧" },
  { value: "american", label: "American", icon: "🇺🇸" },
  { value: "italian", label: "Italian", icon: "🇮🇹" },
  { value: "french", label: "French", icon: "🇫🇷" },
  { value: "mexican", label: "Mexican", icon: "🇲🇽" },
  { value: "indian", label: "Indian", icon: "🇮🇳" },
  { value: "chinese", label: "Chinese", icon: "🇨🇳" },
  { value: "japanese", label: "Japanese", icon: "🇯🇵" },
  { value: "thai", label: "Thai", icon: "🇹🇭" },
  { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
  { value: "middle_eastern", label: "Middle Eastern", icon: "🥙" },
  { value: "african", label: "African", icon: "🌍" },
  { value: "korean", label: "Korean", icon: "🇰🇷" },
  { value: "caribbean", label: "Caribbean", icon: "🏝️" },
  { value: "nordic", label: "Nordic", icon: "❄️" },
  { value: "eastern_european", label: "Eastern European", icon: "🏰" },
];

export const COOKING_METHOD_OPTIONS: { value: CookingMethod; label: string; icon: string }[] = [
  { value: "one_pot", label: "One Pot", icon: "🍲" },
  { value: "oven_baked", label: "Oven Baked", icon: "🔥" },
  { value: "air_fryer", label: "Air Fryer", icon: "💨" },
  { value: "slow_cooker", label: "Slow Cooker", icon: "⏰" },
  { value: "pressure_cooker", label: "Pressure Cooker", icon: "⚡" },
  { value: "bbq_grilled", label: "BBQ/Grilled", icon: "🔥" },
  { value: "stir_fried", label: "Stir Fried", icon: "🥢" },
  { value: "roasted", label: "Roasted", icon: "🍖" },
  { value: "raw_no_cook", label: "Raw/No Cook", icon: "🥒" },
];

export const DIET_LIFESTYLE_OPTIONS: { value: DietLifestyle; label: string; icon: string }[] = [
  { value: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
  { value: "gluten_free", label: "Gluten Free", icon: "🌾" },
  { value: "dairy_free", label: "Dairy Free", icon: "🥛" },
  { value: "low_carb_keto", label: "Low Carb/Keto", icon: "🥩" },
  { value: "high_protein", label: "High Protein", icon: "💪" },
  { value: "paleo", label: "Paleo", icon: "🦴" },
  { value: "diabetic_friendly", label: "Diabetic Friendly", icon: "🩺" },
  { value: "budget_meals", label: "Budget Meals", icon: "💰" },
  { value: "kid_friendly", label: "Kid Friendly", icon: "👶" },
  { value: "pregnancy_safe", label: "Pregnancy Safe", icon: "🤱" },
];

export const COMPLEXITY_LEVEL_OPTIONS: { value: ComplexityLevel; label: string; icon: string }[] = [
  { value: "quick_easy", label: "Quick & Easy", icon: "⚡" },
  { value: "standard", label: "Standard", icon: "⏱️" },
  { value: "complex", label: "Complex", icon: "👨‍🍳" },
];

export const MAIN_INGREDIENT_OPTIONS: { value: MainIngredient; label: string; icon: string }[] = [
  { value: "chicken", label: "Chicken", icon: "🐔" },
  { value: "beef", label: "Beef", icon: "🥩" },
  { value: "pork", label: "Pork", icon: "🐷" },
  { value: "lamb", label: "Lamb", icon: "🐑" },
  { value: "fish", label: "Fish", icon: "🐟" },
  { value: "tofu_tempeh", label: "Tofu/Tempeh", icon: "🥡" },
  { value: "eggs", label: "Eggs", icon: "🥚" },
  { value: "cheese", label: "Cheese", icon: "🧀" },
  { value: "pasta", label: "Pasta", icon: "🍝" },
  { value: "rice", label: "Rice", icon: "🍚" },
  { value: "lentils_beans", label: "Lentils/Beans", icon: "🫘" },
  { value: "vegetables", label: "Vegetables", icon: "🥕" },
  { value: "potatoes", label: "Potatoes", icon: "🥔" },
  { value: "fruit", label: "Fruit", icon: "🍎" },
  { value: "nuts_seeds", label: "Nuts/Seeds", icon: "🥜" },
  { value: "chocolate", label: "Chocolate", icon: "🍫" },
];

// Helper functions
export const getDisplayLabel = (value: string, type: 'mealType' | 'cuisineRegion' | 'cookingMethod' | 'dietLifestyle' | 'complexityLevel' | 'mainIngredient'): string => {
  const optionsMap = {
    mealType: MEAL_TYPE_OPTIONS,
    cuisineRegion: CUISINE_REGION_OPTIONS,
    cookingMethod: COOKING_METHOD_OPTIONS,
    dietLifestyle: DIET_LIFESTYLE_OPTIONS,
    complexityLevel: COMPLEXITY_LEVEL_OPTIONS,
    mainIngredient: MAIN_INGREDIENT_OPTIONS,
  };
  
  const option = optionsMap[type].find(opt => opt.value === value);
  return option ? option.label : value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getIcon = (value: string, type: 'mealType' | 'cuisineRegion' | 'cookingMethod' | 'dietLifestyle' | 'complexityLevel' | 'mainIngredient'): string => {
  const optionsMap = {
    mealType: MEAL_TYPE_OPTIONS,
    cuisineRegion: CUISINE_REGION_OPTIONS,
    cookingMethod: COOKING_METHOD_OPTIONS,
    dietLifestyle: DIET_LIFESTYLE_OPTIONS,
    complexityLevel: COMPLEXITY_LEVEL_OPTIONS,
    mainIngredient: MAIN_INGREDIENT_OPTIONS,
  };
  
  const option = optionsMap[type].find(opt => opt.value === value);
  return option ? option.icon : '';
};
