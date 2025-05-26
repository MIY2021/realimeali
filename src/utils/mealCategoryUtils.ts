
import { RecipeCategory, MealType } from "@/types";

// Categories that are meal-type specific
const BREAKFAST_ONLY_CATEGORIES: RecipeCategory[] = ["Breakfast"];
const LUNCH_ONLY_CATEGORIES: RecipeCategory[] = ["Lunch"];
const SNACKS_ONLY_CATEGORIES: RecipeCategory[] = ["Snacks"];

// Categories excluded from dinner (meal-type specific ones)
const DINNER_EXCLUDED_CATEGORIES: RecipeCategory[] = [
  ...BREAKFAST_ONLY_CATEGORIES,
  ...LUNCH_ONLY_CATEGORIES,
  ...SNACKS_ONLY_CATEGORIES
];

// All available recipe categories
const ALL_RECIPE_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", 
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", "Faffy", 
  "Pricey!", "Not Yet Made", "Snacks", "Breakfast", "Lunch"
];

/**
 * Get allowed categories for a specific meal type
 * Dinner: All categories except breakfast, lunch, and snacks (future-proof)
 * Other meal types: Only their specific categories
 */
export const getAllowedCategoriesForMealType = (mealType: MealType): RecipeCategory[] => {
  switch (mealType) {
    case "dinner":
      // Dynamic: all categories except meal-specific ones
      return ALL_RECIPE_CATEGORIES.filter(
        category => !DINNER_EXCLUDED_CATEGORIES.includes(category)
      );
    case "lunch":
      return LUNCH_ONLY_CATEGORIES;
    case "breakfast":
      return BREAKFAST_ONLY_CATEGORIES;
    case "snacks":
      return SNACKS_ONLY_CATEGORIES;
    default:
      return [];
  }
};

/**
 * Create meal type to categories mapping (for backward compatibility)
 */
export const createMealTypeToCategories = (): Record<MealType, RecipeCategory[]> => {
  return {
    dinner: getAllowedCategoriesForMealType("dinner"),
    lunch: getAllowedCategoriesForMealType("lunch"),
    breakfast: getAllowedCategoriesForMealType("breakfast"),
    snacks: getAllowedCategoriesForMealType("snacks"),
  };
};
