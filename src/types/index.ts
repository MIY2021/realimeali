
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
  cuisine_region?: CuisineRegion;
  diet_lifestyle?: DietLifestyle[];
  complexity_level?: ComplexityLevel;
  slug?: string;
  top_tip?: string;
  main_ingredient?: MainIngredient;
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
  role: 'owner' | 'member';
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
  description: string[];
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

// Updated to include sides, desserts, drinks in meal plans
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "sides" | "desserts" | "drinks";

// Updated to match database cuisine_region enum exactly (with greek added)
export type CuisineRegion = "british" | "american" | "italian" | "french" | "mexican" | "indian" | "chinese" | "japanese" | "thai" | "mediterranean" | "middle_eastern" | "african" | "korean" | "caribbean" | "nordic" | "eastern_european" | "greek";

export type DietLifestyle = "vegetarian" | "vegan" | "gluten_free" | "dairy_free" | "high_protein" | "kid_friendly" | "pescatarian" | "low_carb_keto" | "paleo" | "diabetic_friendly" | "budget_meals" | "pregnancy_safe";

// Updated to match database exactly (changed easy to quick_easy)
export type ComplexityLevel = "quick_easy" | "standard" | "complex";

export type MainIngredient = "chicken" | "beef" | "pork" | "lamb" | "fish" | "tofu_tempeh" | "eggs" | "cheese" | "pasta" | "rice" | "lentils_beans" | "vegetables" | "potatoes" | "fruit" | "nuts_seeds" | "chocolate";
