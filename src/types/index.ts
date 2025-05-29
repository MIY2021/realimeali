
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  image?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  household_id: string;
  meal_type?: MealType;
  cuisine?: Cuisine;
  diet_lifestyle?: DietLifestyle[];
  complexity_level?: ComplexityLevel;
  slug?: string;
}

export interface MealPlan {
  id: string;
  date: string;
  meal_type: string;
  recipe_id: string;
  slot_index: number;
  is_leftover: boolean;
  leftover_servings?: number;
  original_servings: number;
  created_at: string;
  updated_at: string;
  household_id: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  week_number: 1 | 2;
  parent_meal_plan_id?: string;
  created_by: string;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface HouseholdMember {
  id: string;
  user_id: string;
  household_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at: string;
  joined_at: string;
  profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface HouseholdJoinRequest {
  id: string;
  household_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
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
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMealPlan {
  [date: string]: {
    [meal_type: string]: Recipe[];
  };
}

// New simplified category types
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "sides" | "desserts" | "drinks";
export type MealPlanMealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type Cuisine = "british" | "italian" | "asian" | "mexican" | "indian" | "mediterranean" | "american" | "french" | "middle_eastern" | "other";

export type DietLifestyle = "vegetarian" | "vegan" | "gluten_free" | "dairy_free" | "low_carb" | "high_protein" | "budget_friendly" | "kid_friendly";

export type ComplexityLevel = "quick_easy" | "standard" | "complex";
