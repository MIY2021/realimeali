export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type RecipeCategory = 
  | "breakfast"
  | "lunch"
  | "dinner"
  | "dessert"
  | "snack"
  | "appetizer"
  | "beverage"
  | "side";

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
};

export type MealType = "dinner" | "lunch" | "breakfast";

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
