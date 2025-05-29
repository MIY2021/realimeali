
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

// New recipe classification types based on database enums
export type MealType =
  | "breakfast"
  | "lunch" 
  | "dinner"
  | "snacks"
  | "sides"
  | "desserts"
  | "drinks"
  | "sauces_dips"
  | "soups_stews"
  | "salads"
  | "baking_breads";

export type CuisineRegion =
  | "british"
  | "american"
  | "italian"
  | "french"
  | "mexican"
  | "indian"
  | "chinese"
  | "japanese"
  | "thai"
  | "mediterranean"
  | "middle_eastern"
  | "african"
  | "korean"
  | "caribbean"
  | "nordic"
  | "eastern_european";

export type CookingMethod =
  | "one_pot"
  | "oven_baked"
  | "air_fryer"
  | "slow_cooker"
  | "pressure_cooker"
  | "bbq_grilled"
  | "stir_fried"
  | "roasted"
  | "raw_no_cook";

export type DietLifestyle =
  | "vegetarian"
  | "vegan" 
  | "pescatarian"
  | "gluten_free"
  | "dairy_free"
  | "low_carb_keto"
  | "high_protein"
  | "paleo"
  | "diabetic_friendly"
  | "budget_meals"
  | "kid_friendly"
  | "pregnancy_safe";

export type ComplexityLevel =
  | "quick_easy"
  | "standard"
  | "complex";

export type MainIngredient =
  | "chicken"
  | "beef"
  | "pork"
  | "lamb"
  | "fish"
  | "tofu_tempeh"
  | "eggs"
  | "cheese"
  | "pasta"
  | "rice"
  | "lentils_beans"
  | "vegetables"
  | "potatoes"
  | "fruit"
  | "nuts_seeds"
  | "chocolate";

// Updated Recipe type with new classification fields
export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  // New structured classification fields
  mealType?: MealType;
  cuisineRegion?: CuisineRegion;
  cookingMethod?: CookingMethod;
  dietLifestyle?: DietLifestyle[];
  complexityLevel?: ComplexityLevel;
  mainIngredient?: MainIngredient;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  image?: string;
  topTip?: string;
  createdBy: string; // user id
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isFavorite: boolean;
  householdId: string; // household id
};

// Meal plan uses only core meal types (simplified subset)
export type MealPlanMealType = "dinner" | "lunch" | "breakfast" | "snacks";

export type MealPlan = {
  id: string;
  date: string;
  mealType: MealPlanMealType; // Limited to core 4 types
  recipeId: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  slotIndex: number;
  parentMealPlanId?: string; // Links to the original dinner
  isLeftover: boolean;
  leftoverServings?: number; // How many servings from original meal
  originalServings?: number; // Total servings from original recipe
  householdId: string; // household id
  weekNumber: number; // Added weekNumber property
};
