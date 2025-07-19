import { MealType } from "@/types";

/**
 * Utility functions for handling meal types (both legacy single and new multiple)
 */

/**
 * Gets meal types as an array, handling both new meal_types and legacy meal_type
 */
export function getMealTypesArray(recipe: { meal_types?: MealType[]; meal_type?: MealType }): MealType[] {
  if (recipe.meal_types && recipe.meal_types.length > 0) {
    return recipe.meal_types;
  }
  
  if (recipe.meal_type) {
    return [recipe.meal_type];
  }
  
  return [];
}

/**
 * Checks if a recipe has a specific meal type
 */
export function hasMealType(recipe: { meal_types?: MealType[]; meal_type?: MealType }, mealType: MealType): boolean {
  const mealTypes = getMealTypesArray(recipe);
  return mealTypes.includes(mealType);
}

/**
 * Gets the primary meal type for display purposes (first in array)
 */
export function getPrimaryMealType(recipe: { meal_types?: MealType[]; meal_type?: MealType }): MealType | undefined {
  const mealTypes = getMealTypesArray(recipe);
  return mealTypes.length > 0 ? mealTypes[0] : undefined;
}

/**
 * Formats meal types for display
 */
export function formatMealTypesForDisplay(recipe: { meal_types?: MealType[]; meal_type?: MealType }): string {
  const mealTypes = getMealTypesArray(recipe);
  
  if (mealTypes.length === 0) return "Not specified";
  if (mealTypes.length === 1) return capitalizeFirst(mealTypes[0]);
  if (mealTypes.length === 2) return `${capitalizeFirst(mealTypes[0])} & ${capitalizeFirst(mealTypes[1])}`;
  
  return `${capitalizeFirst(mealTypes[0])} & ${mealTypes.length - 1} more`;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}