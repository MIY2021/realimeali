import { MealType, CuisineRegion, DietLifestyle, ComplexityLevel } from "@/types";

export const MEAL_TYPE_OPTIONS = [
  { value: "breakfast" as MealType, label: "Breakfast", icon: "🌅" },
  { value: "lunch" as MealType, label: "Lunch", icon: "☀️" },
  { value: "dinner" as MealType, label: "Dinner", icon: "🌙" },
  { value: "snacks" as MealType, label: "Snacks", icon: "🍿" },
  { value: "sides" as MealType, label: "Sides", icon: "🥗" },
  { value: "desserts" as MealType, label: "Desserts", icon: "🍰" },
  { value: "drinks" as MealType, label: "Drinks", icon: "🥤" },
];

export const CUISINE_REGION_OPTIONS = [
  { value: "british" as CuisineRegion, label: "British", icon: "🇬🇧" },
  { value: "american" as CuisineRegion, label: "American", icon: "🇺🇸" },
  { value: "italian" as CuisineRegion, label: "Italian", icon: "🇮🇹" },
  { value: "french" as CuisineRegion, label: "French", icon: "🇫🇷" },
  { value: "mexican" as CuisineRegion, label: "Mexican", icon: "🇲🇽" },
  { value: "indian" as CuisineRegion, label: "Indian", icon: "🇮🇳" },
  { value: "chinese" as CuisineRegion, label: "Chinese", icon: "🇨🇳" },
  { value: "japanese" as CuisineRegion, label: "Japanese", icon: "🇯🇵" },
  { value: "thai" as CuisineRegion, label: "Thai", icon: "🇹🇭" },
  { value: "mediterranean" as CuisineRegion, label: "Mediterranean", icon: "🫒" },
  { value: "middle_eastern" as CuisineRegion, label: "Middle Eastern", icon: "🥙" },
  { value: "african" as CuisineRegion, label: "African", icon: "🌍" },
  { value: "korean" as CuisineRegion, label: "Korean", icon: "🇰🇷" },
  { value: "caribbean" as CuisineRegion, label: "Caribbean", icon: "🏝️" },
  { value: "nordic" as CuisineRegion, label: "Nordic", icon: "❄️" },
  { value: "eastern_european" as CuisineRegion, label: "Eastern European", icon: "🏰" },
  { value: "greek" as CuisineRegion, label: "Greek", icon: "🇬🇷" },
];

export const DIET_LIFESTYLE_OPTIONS = [
  { value: "vegetarian" as DietLifestyle, label: "Vegetarian", icon: "🥬" },
  { value: "vegan" as DietLifestyle, label: "Vegan", icon: "🌱" },
  { value: "gluten_free" as DietLifestyle, label: "Gluten Free", icon: "🚫" },
  { value: "dairy_free" as DietLifestyle, label: "Dairy Free", icon: "🥛" },
  { value: "high_protein" as DietLifestyle, label: "High Protein", icon: "💪" },
  { value: "kid_friendly" as DietLifestyle, label: "Kid Friendly", icon: "👶" },
  { value: "pescatarian" as DietLifestyle, label: "Pescatarian", icon: "🐟" },
  { value: "low_carb_keto" as DietLifestyle, label: "Low Carb/Keto", icon: "🥓" },
  { value: "paleo" as DietLifestyle, label: "Paleo", icon: "🦴" },
  { value: "diabetic_friendly" as DietLifestyle, label: "Diabetic Friendly", icon: "🩺" },
  { value: "budget_meals" as DietLifestyle, label: "Budget Meals", icon: "💰" },
  { value: "pregnancy_safe" as DietLifestyle, label: "Pregnancy Safe", icon: "🤰" },
];

export const COMPLEXITY_LEVEL_OPTIONS = [
  { value: "quick_easy" as ComplexityLevel, label: "Quick & Easy", icon: "⚡" },
  { value: "standard" as ComplexityLevel, label: "Standard", icon: "⭐" },
  { value: "complex" as ComplexityLevel, label: "Complex", icon: "👨‍🍳" },
];

export function getDisplayLabel(value: string, type: 'mealType' | 'cuisineRegion' | 'dietLifestyle' | 'complexityLevel'): string {
  let options;
  
  switch (type) {
    case 'mealType':
      options = MEAL_TYPE_OPTIONS;
      break;
    case 'cuisineRegion':
      options = CUISINE_REGION_OPTIONS;
      break;
    case 'dietLifestyle':
      options = DIET_LIFESTYLE_OPTIONS;
      break;
    case 'complexityLevel':
      options = COMPLEXITY_LEVEL_OPTIONS;
      break;
    default:
      return value;
  }
  
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
}

// Keep old names for backward compatibility
export const CUISINE_OPTIONS = CUISINE_REGION_OPTIONS;
