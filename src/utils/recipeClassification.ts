
import { 
  MealType, 
  Cuisine, 
  DietLifestyle, 
  ComplexityLevel 
} from "@/types";

// Simplified classification options with display labels and icons
export const MEAL_TYPE_OPTIONS: { value: MealType; label: string; icon: string }[] = [
  { value: "breakfast", label: "Breakfast", icon: "🍳" },
  { value: "lunch", label: "Lunch", icon: "🥗" },
  { value: "dinner", label: "Dinner", icon: "🍽️" },
  { value: "snacks", label: "Snacks", icon: "🍿" },
  { value: "sides", label: "Sides", icon: "🥖" },
  { value: "desserts", label: "Desserts", icon: "🍰" },
  { value: "drinks", label: "Drinks", icon: "🥤" },
];

export const CUISINE_OPTIONS: { value: Cuisine; label: string; icon: string }[] = [
  { value: "british", label: "British", icon: "🇬🇧" },
  { value: "italian", label: "Italian", icon: "🇮🇹" },
  { value: "asian", label: "Asian", icon: "🥢" },
  { value: "mexican", label: "Mexican", icon: "🇲🇽" },
  { value: "indian", label: "Indian", icon: "🇮🇳" },
  { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
  { value: "american", label: "American", icon: "🇺🇸" },
  { value: "french", label: "French", icon: "🇫🇷" },
  { value: "middle_eastern", label: "Middle Eastern", icon: "🥙" },
  { value: "other", label: "Other", icon: "🌍" },
];

export const DIET_LIFESTYLE_OPTIONS: { value: DietLifestyle; label: string; icon: string }[] = [
  { value: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "gluten_free", label: "Gluten-Free", icon: "🌾" },
  { value: "dairy_free", label: "Dairy-Free", icon: "🥛" },
  { value: "low_carb_keto", label: "Low-Carb/Keto", icon: "🥩" },
  { value: "high_protein", label: "High Protein", icon: "💪" },
  { value: "budget_meals", label: "Budget-Friendly", icon: "💰" },
  { value: "kid_friendly", label: "Kid-Friendly", icon: "👶" },
];

export const COMPLEXITY_LEVEL_OPTIONS: { value: ComplexityLevel; label: string; icon: string }[] = [
  { value: "quick_easy", label: "Quick & Easy", icon: "⚡" },
  { value: "standard", label: "Standard", icon: "⏱️" },
  { value: "complex", label: "Complex", icon: "👨‍🍳" },
];

// Helper functions
export const getDisplayLabel = (value: string, type: 'mealType' | 'cuisine' | 'dietLifestyle' | 'complexityLevel'): string => {
  const optionsMap = {
    mealType: MEAL_TYPE_OPTIONS,
    cuisine: CUISINE_OPTIONS,
    dietLifestyle: DIET_LIFESTYLE_OPTIONS,
    complexityLevel: COMPLEXITY_LEVEL_OPTIONS,
  };
  
  const option = optionsMap[type].find(opt => opt.value === value);
  return option ? option.label : value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getIcon = (value: string, type: 'mealType' | 'cuisine' | 'dietLifestyle' | 'complexityLevel'): string => {
  const optionsMap = {
    mealType: MEAL_TYPE_OPTIONS,
    cuisine: CUISINE_OPTIONS,
    dietLifestyle: DIET_LIFESTYLE_OPTIONS,
    complexityLevel: COMPLEXITY_LEVEL_OPTIONS,
  };
  
  const option = optionsMap[type].find(opt => opt.value === value);
  return option ? option.icon : '';
};
