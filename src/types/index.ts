
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

// Updated to match the database schema exactly
export type RecipeCategory =
  | "Bulk"
  | "Easy"
  | "Cheap"
  | "Healthy"
  | "Vegetarian"
  | "Fish"
  | "Super Tasty"
  | "Pasta"
  | "Tapas"
  | "Winter"
  | "BBQ"
  | "Faffy"
  | "Pricey!"
  | "Not Yet Made"
  | "Snacks"
  | "Breakfast";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  categories: RecipeCategory[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  image?: string;
  createdBy: string; // user id
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isFavorite: boolean;
  householdId: string; // household id
};

export type MealType = "dinner" | "lunch" | "breakfast" | "snacks";

export type MealPlan = {
  id: string;
  date: string;
  mealType: MealType;
  recipeId: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  slotIndex: number;
};
