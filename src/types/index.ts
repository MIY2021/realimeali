
export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  mealType?: MealType;
  cuisine?: Cuisine;
  dietLifestyle: DietLifestyle[];
  complexityLevel?: ComplexityLevel;
  prepTime: number;
  cookTime: number;
  servings: number;
  image?: string;
  isFavorite: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  householdId: string;
  slug: string;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type Cuisine = "italian" | "mexican" | "chinese" | "indian" | "american" | "french" | "greek" | "thai" | "japanese" | "mediterranean" | "other";
export type ComplexityLevel = "easy" | "intermediate" | "difficult";

export type DietLifestyle = 
  | "vegetarian" 
  | "vegan" 
  | "gluten_free" 
  | "dairy_free" 
  | "high_protein" 
  | "kid_friendly" 
  | "pescatarian" 
  | "low_carb_keto" 
  | "paleo" 
  | "diabetic_friendly" 
  | "budget_meals" 
  | "pregnancy_safe";

export type MealPlanMealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type MealPlan = {
  id: string;
  date: string;
  mealType: MealPlanMealType;
  recipeId: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  slotIndex: number;
  isLeftover: boolean;
  householdId: string;
  weekNumber: 1 | 2;
  originalServings: number;
  leftoverServings?: number;
  parentMealPlanId?: string;
};

export type Household = {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  updated_at?: string;
};

export type PublicRecipeShare = {
  id: string;
  recipe_id: string;
  public_share_id: string;
  is_active: boolean;
  view_count: number;
  created_at: string;
};
