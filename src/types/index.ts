
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    full_name?: string;
  };
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
  | "Breakfast"
  | "Lunch";

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
  topTip?: string; // New field for cooking tips
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
  parentMealPlanId?: string; // Links to the original dinner
  isLeftover: boolean;
  leftoverServings?: number; // How many servings from original meal
  originalServings?: number; // Total servings from original recipe
  householdId: string; // household id
  weekNumber: number; // Added weekNumber property
};

export type Household = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type HouseholdMember = {
  id: string;
  householdId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user?: User;
};

export type JoinRequest = {
  id: string;
  householdId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user?: User;
  household?: Household;
};
