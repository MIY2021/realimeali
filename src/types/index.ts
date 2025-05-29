export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  image?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  householdId: string;
  mealType?: MealType;
  cuisine?: Cuisine;
  dietLifestyle?: DietLifestyle[];
  complexityLevel?: ComplexityLevel;
  slug?: string;
  topTip?: string;
}

export interface MealPlan {
  id: string;
  date: string;
  mealType: string;
  recipeId: string;
  slotIndex: number;
  isLeftover: boolean;
  leftoverServings?: number;
  originalServings: number;
  createdAt: string;
  updatedAt: string;
  householdId: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  weekNumber: 1 | 2;
  parentMealPlanId?: string;
  createdBy: string;
}

export interface Household {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface HouseholdMember {
  id: string;
  userId: string;
  householdId: string;
  role: 'owner' | 'member';
  createdAt: string;
  updatedAt: string;
}

export interface PublicRecipeShare {
  public_share_id: string;
  original_recipe_id: string;
  shared_by_user_id: string;
  shared_by_name: string;
  shared_by_household_name: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  image?: string;
  expires_at: string;
  created_at: string;
  meal_type?: string;
  original_household_id: string;
  view_count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMealPlan {
  [date: string]: {
    [mealType: string]: Recipe[];
  };
}

// New simplified category types
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "sides" | "desserts" | "drinks";
export type MealPlanMealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type Cuisine = "british" | "italian" | "asian" | "mexican" | "indian" | "mediterranean" | "american" | "french" | "middle_eastern" | "other";

export type DietLifestyle = "vegetarian" | "vegan" | "gluten_free" | "dairy_free" | "low_carb" | "high_protein" | "budget_friendly" | "kid_friendly";

export type ComplexityLevel = "quick_easy" | "standard" | "complex";
