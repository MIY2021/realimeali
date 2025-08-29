
import { MealType } from "@/types";

// Helper function to determine appropriate meal types for meal planning
export const getAllowedCategoriesForMealType = (mealType: MealType): string[] => {
  // For the new system, we can be more flexible with meal planning
  // Any recipe can potentially be used for any meal, but we can suggest appropriate ones
  const mealTypeMap: Record<MealType, string[]> = {
    breakfast: ["breakfast", "quick", "easy"],
    lunch: ["lunch", "salads", "soups", "quick", "easy"],
    dinner: ["dinner", "main", "hearty"],
    snacks: ["snacks", "light", "quick"],
    sides: ["sides", "accompaniment"],
    desserts: ["desserts", "sweet"],
    drinks: ["drinks", "beverages"],
    appetizers: ["appetizers", "starters", "light"]
  };

  return mealTypeMap[mealType] || [];
};
