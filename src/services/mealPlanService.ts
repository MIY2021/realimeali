
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
    mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>, 
    weekNumber: 1 | 2,
    householdId: string,
    userId: string,
    silentMode = false
  ): Promise<MealPlan> {
    const insertData = {
      household_id: householdId,
      recipe_id: mealPlanData.recipe_id || null,
      meal_type: mealPlanData.meal_type,
      week_number: weekNumber,
      slot_index: mealPlanData.slot_index || 0,
      date_scheduled: mealPlanData.date,
      created_by: userId,
      parent_meal_plan_id: mealPlanData.parent_meal_plan_id || null,
      is_leftover: mealPlanData.is_leftover || false,
      leftover_servings: mealPlanData.leftover_servings || null,
      original_servings: mealPlanData.original_servings || null,
      planned_servings: mealPlanData.planned_servings,
      is_completed: false, // New meals start as not completed
      is_freetyped: mealPlanData.is_freetyped || false,
      meal_name: mealPlanData.meal_name || null,
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

  async updateMealPlanServings(
    mealPlanId: string, 
    plannedServings: number,
    householdId: string
  ): Promise<void> {
    console.log("Updating meal plan servings:", { mealPlanId, plannedServings, householdId });
    
    const { data, error } = await supabase
      .from('household_meal_plans')
      .update({ planned_servings: plannedServings })
      .eq('id', mealPlanId)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) {
      console.error("Error updating meal plan servings:", error);
      throw error;
    }

    console.log("Successfully updated servings:", data);
  },

  async updateMealPlanCompletion(
    mealPlanId: string, 
    isCompleted: boolean,
    householdId: string
  ): Promise<void> {
    console.log("Updating meal plan completion:", { mealPlanId, isCompleted, householdId });
    
    const { data, error } = await supabase
      .from('household_meal_plans')
      .update({ is_completed: isCompleted })
      .eq('id', mealPlanId)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) {
      console.error("Error updating meal plan completion:", error);
      throw error;
    }

    console.log("Successfully updated completion status:", data);
  },

  async updateMealPlanLeftoverAllocation(
    mealPlanId: string, 
    leftoverServings: number,
    householdId: string
  ): Promise<void> {
    console.log("Updating meal plan leftover allocation:", { mealPlanId, leftoverServings, householdId });
    
    const { data, error } = await supabase
      .from('household_meal_plans')
      .update({ leftover_servings: leftoverServings })
      .eq('id', mealPlanId)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) {
      console.error("Error updating meal plan leftover allocation:", error);
      throw error;
    }

    console.log("Successfully updated leftover allocation:", data);
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
      meal_type: dbPlan.meal_type as any,
      recipe_id: dbPlan.recipe_id,
      created_by: dbPlan.created_by,
      created_at: dbPlan.created_at,
      updated_at: dbPlan.updated_at,
      slot_index: dbPlan.slot_index,
      parent_meal_plan_id: dbPlan.parent_meal_plan_id,
      is_leftover: dbPlan.is_leftover,
      leftover_servings: dbPlan.leftover_servings,
      original_servings: dbPlan.original_servings,
      planned_servings: dbPlan.planned_servings,
      household_id: dbPlan.household_id,
      week_number: dbPlan.week_number as 1 | 2,
      is_completed: dbPlan.is_completed,
      is_freetyped: dbPlan.is_freetyped,
      meal_name: dbPlan.meal_name,
    };
  }
};
