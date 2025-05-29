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
  mealType?: string;
  cuisineRegion?: string;
  cookingMethod?: string;
  complexityLevel?: string;
  mainIngredient?: string;
  dietLifestyle?: string[];
  slug?: string;
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
  recipe_id: string;
  shared_by: string;
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
  cuisine_region?: string;
  cooking_method?: string;
  complexity_level?: string;
  main_ingredient?: string;
  diet_lifestyle?: string[];
  original_recipe_id: string;
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

// Align meal type definitions
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type MealPlanMealType = MealType;
