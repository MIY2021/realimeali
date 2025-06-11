export type Category = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Ingredient = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: string;
  unit: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  category_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  notes?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_dairy_free?: boolean;
};

export type RecipeStep = {
  id: string;
  recipe_id: string;
  step_number: number;
  description: string;
  created_at: string;
  updated_at: string;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface MealPlan {
  id: string;
  date: string;
  meal_type: MealType;
  recipe_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  slot_index?: number;
  parent_meal_plan_id?: string;
  is_leftover?: boolean;
  leftover_servings?: number;
  original_servings?: number;
  household_id: string;
  week_number: 1 | 2;
  planned_servings?: number;
}
