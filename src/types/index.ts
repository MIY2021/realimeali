export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  ingredient_group_indices?: number[]; // Indices of ingredients that are group headers (as identified by AI or user)
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  image?: string;
  image_thumbnail?: string; // Optimized thumbnail image
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_profile?: {
    full_name?: string;
    email?: string;
  };
  last_updated_by?: string;
  household_id: string;
  meal_type?: MealType; // Legacy field - use meal_types instead
  meal_types?: MealType[]; // New field for multiple meal types
  cuisine_region?: CuisineRegion;
  diet_lifestyle?: DietLifestyle[];
  // complexity_level removed - using cooking duration calculation instead
  slug?: string;
  top_tip?: string;
  has_cooked?: boolean; // New field to track if household has cooked this recipe
  source_url?: string; // URL the recipe was imported from
  import_method?: string; // How the recipe was created
  fruit_veg_portions?: number; // Estimated 5-a-day portions per serving
  fruit_veg_breakdown?: string; // Summary of fruit/veg analysis
  fruit_veg_ingredient_breakdown?: any; // Detailed per-ingredient analysis (JSON)
  fruit_veg_recommendations?: any; // Suggestions to boost score (JSON)
  fruit_veg_total_grams?: number; // Total grams of fruit/veg per serving
  alcoholic_pairing?: string; // AI-generated wine/beer/cocktail pairing
  non_alcoholic_pairing?: string; // AI-generated non-alcoholic beverage pairing
}

export interface RecipeNote {
  id: string;
  recipe_id: string;
  household_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  date: string;
  meal_type: string; // Legacy field - use meal_types instead
  meal_types?: MealType[]; // New field for multiple meal types
  recipe_id?: string; // Optional for freetyped meals
  slot_index: number;
  is_leftover: boolean;
  leftover_servings?: number;
  original_servings: number;
  planned_servings: number; // New field for user-selected serving size
  created_at: string;
  updated_at: string;
  household_id: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  week_key: string; // ISO week key format: "YYYY-Www" (e.g., "2025-W03")
  week_number?: 1 | 2; // Legacy field - kept for migration compatibility
  parent_meal_plan_id?: string;
  created_by: string;
  is_completed: boolean; // Add completion status
  is_freetyped: boolean; // Indicates if this is a custom meal name
  meal_name?: string; // Custom meal name for freetyped meals
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
    auth_provider?: string;
    avatar_type?: string;
    avatar_data?: string;
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
  alcoholic_pairing?: string;
  non_alcoholic_pairing?: string;
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

// Updated to include sides, desserts, drinks, appetizers in meal plans
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "sides" | "desserts" | "drinks" | "appetizers" | "sauce";

// Updated to match database cuisine_region enum exactly (with greek and spanish added)
export type CuisineRegion = "british" | "american" | "italian" | "french" | "mexican" | "indian" | "chinese" | "japanese" | "thai" | "mediterranean" | "middle_eastern" | "african" | "korean" | "caribbean" | "nordic" | "eastern_european" | "greek" | "spanish";

export type DietLifestyle = "vegetarian" | "vegan" | "gluten_free" | "dairy_free" | "high_protein" | "kid_friendly" | "pescatarian" | "low_carb_keto" | "paleo" | "diabetic_friendly" | "budget_meals" | "pregnancy_safe" | "low_fat" | "batch_cooking";

// ComplexityLevel type removed - using cooking duration calculation instead
export type CookingDuration = "0-30" | "30-60" | "60+";
