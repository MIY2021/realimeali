export type Theme = "system" | "dark" | "light";

export type NavigationItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
};

export interface DataTableSearchableColumn<TData> {
  id: keyof TData;
  title: string;
}

export interface DataTableFilterableColumn<TData>
  extends DataTableSearchableColumn<TData> {
  options: { label: string; value: string }[];
}

export type DashboardConfig = {
  mainNav: NavigationItem[];
  sidebarNav: NavigationItem[];
};

export type SettingsConfig = {
  mainNav: NavigationItem[];
  sidebarNav: NavigationItem[];
};

export type Household = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
};

export type PublicShare = {
  id: string;
  recipe_id: string;
  shared_by_name: string;
  household_name: string;
  created_at: string;
  updated_at: string;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "sides" | "desserts" | "drinks";
export type Cuisine = "american" | "italian" | "mexican" | "chinese" | "indian" | "french" | "japanese" | "korean" | "thai" | "mediterranean" | "greek" | "spanish" | "german" | "moroccan" | "lebanese" | "vietnamese" | "cajun" | "caribbean" | "south_american" | "african" | "fusion";
export type CookingMethod = "baking" | "frying" | "roasting" | "grilling" | "steaming" | "boiling" | "sauteing" | "stir_frying" | "braising" | "poaching" | "raw";
export type DietLifestyle = "vegetarian" | "vegan" | "gluten_free" | "dairy_free" | "keto" | "paleo" | "low_carb" | "mediterranean" | "whole30";
export type ComplexityLevel = "easy" | "intermediate" | "advanced";
export type MainIngredient = "chicken" | "beef" | "pork" | "fish" | "seafood" | "tofu" | "eggs" | "pasta" | "rice" | "beans" | "lentils" | "vegetables" | "fruits" | "nuts" | "seeds" | "dairy";

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  image?: string;
  is_favorite: boolean;
  meal_type?: MealType;
  cuisine_region?: Cuisine;
  cooking_method?: CookingMethod;
  diet_lifestyle?: DietLifestyle[];
  complexity_level?: ComplexityLevel;
  main_ingredient?: MainIngredient;
  top_tip?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  household_id: string;
  slug?: string;
  meal_plan_count: number; // Add this new field
}

export type MealPlanMealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface MealPlan {
  id: string;
  date: string;
  meal_type: MealPlanMealType;
  recipe_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  slot_index: number;
  parent_meal_plan_id?: string | null;
  is_leftover: boolean;
  leftover_servings?: number | null;
  original_servings?: number | null;
  household_id: string;
  week_number: 1 | 2;
}
