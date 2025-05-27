
import { supabase } from "@/integrations/supabase/client";
import { MealPlan, MealType } from "@/types";
import { HouseholdMealPlan } from "@/contexts/MealPlanContext";

export const mealPlanService = {
  async fetchMealPlans(householdId: string): Promise<MealPlan[]> {
    console.log("Fetching meal plans for household:", householdId);
    
    const { data, error } = await supabase
      .from('household_meal_plans')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching meal plans:", error);
      throw error;
    }

    console.log("Fetched meal plans data:", data);

    return (data || []).map(this.transformDbToMealPlan);
  },

  async addMealPlan(
    mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, 
    weekNumber: 1 | 2,
    householdId: string,
    userId: string,
    silentMode = false
  ): Promise<MealPlan> {
    const insertData = {
      household_id: householdId,
      recipe_id: mealPlanData.recipeId,
      meal_type: mealPlanData.mealType,
      week_number: weekNumber,
      slot_index: mealPlanData.slotIndex || 0,
      notes: mealPlanData.notes || null,
      date_scheduled: mealPlanData.date,
      created_by: userId,
      parent_meal_plan_id: mealPlanData.parentMealPlanId || null,
      is_leftover: mealPlanData.isLeftover || false,
      leftover_servings: mealPlanData.leftoverServings || null,
      original_servings: mealPlanData.originalServings || null,
    };

    if (!silentMode) {
      console.log("Insert data:", insertData);
    }

    const { data, error } = await supabase
      .from('household_meal_plans')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    if (!silentMode) {
      console.log("Meal plan added successfully:", data);
    }
    return this.transformDbToMealPlan(data);
  },

  async removeMealPlan(id: string, householdId: string): Promise<void> {
    console.log("Removing meal plan:", id);
    
    const { error } = await supabase
      .from('household_meal_plans')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) {
      throw error;
    }
  },

  async clearWeek(weekNumber: 1 | 2, householdId: string): Promise<void> {
    console.log("Clearing week:", weekNumber);
    
    const { error } = await supabase
      .from('household_meal_plans')
      .delete()
      .eq('household_id', householdId)
      .eq('week_number', weekNumber);

    if (error) {
      throw error;
    }
  },

  async reorderMealPlans(
    mealType: MealType, 
    weekNumber: 1 | 2, 
    householdId: string,
    reorderedPlans: MealPlan[]
  ): Promise<void> {
    const updatePromises = reorderedPlans.map((plan, index) => 
      supabase
        .from('household_meal_plans')
        .update({ slot_index: index })
        .eq('id', plan.id)
        .eq('household_id', householdId)
        .eq('week_number', weekNumber)
    );

    const results = await Promise.all(updatePromises);
    
    const hasError = results.some(result => result.error);
    if (hasError) {
      throw new Error("Failed to update meal plan order");
    }
  },

  transformDbToMealPlan(dbPlan: HouseholdMealPlan): MealPlan {
    return {
      id: dbPlan.id,
      date: dbPlan.date_scheduled,
      mealType: dbPlan.meal_type as any,
      recipeId: dbPlan.recipe_id,
      notes: dbPlan.notes,
      createdBy: dbPlan.created_by,
      createdAt: dbPlan.created_at,
      updatedAt: dbPlan.updated_at,
      slotIndex: dbPlan.slot_index,
      parentMealPlanId: dbPlan.parent_meal_plan_id,
      isLeftover: dbPlan.is_leftover,
      leftoverServings: dbPlan.leftover_servings,
      originalServings: dbPlan.original_servings,
      householdId: dbPlan.household_id,
    };
  }
};
