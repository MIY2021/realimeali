
import { MealPlan, Recipe, MealType } from "@/types";

export interface HouseholdMealPlan {
  id: string;
  household_id: string;
  recipe_id: string;
  meal_type: string;
  week_number: number;
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
}

export interface MealPlanContextType {
  mealPlans: MealPlan[];
  getMealPlansForWeek: (weekNumber: 1 | 2) => MealPlan[];
  getRecipeForMealPlan: (mealPlan: MealPlan) => Recipe | undefined;
  addMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2, silentMode?: boolean) => Promise<void>;
  addMealPlanWithLeftovers: (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2, leftoverServings?: number, silentMode?: boolean) => Promise<void>;
  removeMealPlan: (id: string) => Promise<void>;
  clearWeek: (weekNumber: 1 | 2) => Promise<void>;
  reorderMealPlans: (mealType: MealType, weekNumber: 1 | 2, sourceIndex: number, destinationIndex: number) => Promise<void>;
  isLoading: boolean;
}
