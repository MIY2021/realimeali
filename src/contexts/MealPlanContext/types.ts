
import { MealPlan, Recipe, MealType } from "@/types";

export interface HouseholdMealPlan {
  id: string;
  household_id: string;
  recipe_id?: string; // Optional for freetyped meals
  meal_type: string; // Legacy field - use meal_types instead
  meal_types?: MealType[]; // New field for multiple meal types
  week_key: string; // ISO week key format: "YYYY-Www"
  week_number?: number; // Legacy field - kept for migration compatibility
  slot_index: number;
  notes?: string;
  date_scheduled: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  parent_meal_plan_id?: string;
  is_leftover: boolean;
  leftover_servings?: number;
  original_servings?: number;
  planned_servings: number;
  is_completed: boolean; // Add completion status
  is_freetyped: boolean; // Indicates if this is a custom meal name
  meal_name?: string; // Custom meal name for freetyped meals
}

export interface MealPlanContextType {
  mealPlans: MealPlan[];
  getMealPlansForWeek: (weekKey: string) => MealPlan[];
  getRecipeForMealPlan: (mealPlan: MealPlan) => Recipe | undefined;
  addMealPlan: (mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>, weekKey: string, silentMode?: boolean) => Promise<MealPlan>;
  addMealPlanWithLeftovers: (mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>, weekKey: string, leftoverServings?: number, silentMode?: boolean) => Promise<void>;
  removeMealPlan: (id: string) => Promise<void>;
  clearWeek: (weekKey: string) => Promise<void>;
  copyWeek: (sourceWeekKey: string, targetWeekKey: string) => Promise<void>;
  reorderMealPlans: (mealType: MealType, weekKey: string, reorderedIds: string[]) => Promise<void>;
  updateMealPlanServings: (mealPlanId: string, plannedServings: number) => Promise<void>;
  replaceFreetypedMealPlan: (mealPlanId: string, recipeId: string, plannedServings: number) => Promise<void>;
  updateMealPlanCompletion: (mealPlanId: string, isCompleted: boolean) => Promise<void>; // Add completion function
  isLoading: boolean;
  fetchMealPlans?: () => Promise<void>;
}
