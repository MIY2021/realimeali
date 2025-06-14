export type Category =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "dessert"
  | "side dish"
  | "appetizer"
  | "salad"
  | "soup"
  | "sauce"
  | "drink"
  | "baking"
  | "other";

export type Cuisine =
  | "american"
  | "italian"
  | "mexican"
  | "chinese"
  | "indian"
  | "thai"
  | "japanese"
  | "korean"
  | "vietnamese"
  | "mediterranean"
  | "greek"
  | "spanish"
  | "french"
  | "german"
  | "irish"
  | "british"
  | "cajun"
  | "creole"
  | "moroccan"
  | "lebanese"
  | "israeli"
  | "turkish"
  | "russian"
  | "brazilian"
  | "caribbean"
  | "african"
  | "fusion"
  | "other";

export type Diet =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "keto"
  | "paleo"
  | "low-carb"
  | "mediterranean"
  | "pescatarian"
  | "whole30"
  | "other";

export type Allergy =
  | "dairy"
  | "eggs"
  | "gluten"
  | "peanuts"
  | "soy"
  | "tree nuts"
  | "fish"
  | "shellfish"
  | "sesame"
  | "mustard"
  | "celery"
  | "lupin"
  | "molluscs"
  | "sulfites"
  | "other";

export type Ingredient = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
};

export type Step = {
  id: string;
  order: number;
  text: string;
};

export type Recipe = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  categories: Category[];
  cuisine?: Cuisine;
  diet?: Diet[];
  allergies?: Allergy[];
  ingredients: Ingredient[];
  steps: Step[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  household_id?: string;
  community_owned: boolean;
  source_url?: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  households?: Household[];
};

export type Household = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
};

export type Invitation = {
  id: string;
  household_id: string;
  invited_email: string;
  sent_by: string;
  created_at: string;
  accepted_at?: string;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealPlan {
  id: string;
  date: string;
  meal_type: MealType;
  recipe_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  slot_index: number;
  parent_meal_plan_id?: string;
  is_leftover: boolean;
  leftover_servings?: number;
  original_servings?: number;
  planned_servings?: number;
  household_id: string;
  week_number: 1 | 2;
  is_completed?: boolean; // New field for completion status
}
