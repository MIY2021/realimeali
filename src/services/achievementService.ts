import { supabase } from "@/integrations/supabase/client";
import { Achievement } from "@/types/achievements";

export interface UserAchievement {
  id: string;
  user_id: string;
  household_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_data: Record<string, any>;
}

export interface AchievementProgress {
  current: number;
  required: number;
  percentage: number;
}

class AchievementService {
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      progress_data: typeof item.progress_data === 'object' && item.progress_data !== null 
        ? item.progress_data as Record<string, any>
        : {}
    }));
  }

  async unlockAchievement(
    userId: string,
    householdId: string,
    achievementId: string,
    progressData: Record<string, any> = {}
  ): Promise<boolean> {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        household_id: householdId,
        achievement_id: achievementId,
        progress_data: progressData
      });

    if (error) {
      // Ignore unique constraint violations (already unlocked)
      if (error.code === '23505') {
        return false;
      }
      console.error('Error unlocking achievement:', error);
      return false;
    }

    return true;
  }

  async getCookedRecipeCount(householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('household_recipe_cooking_status')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('has_cooked', true);

    if (error) {
      console.error('Error getting cooked recipe count:', error);
      return 0;
    }

    return count || 0;
  }

  async getCookedRecipesList(householdId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('household_recipe_cooking_status')
      .select('recipe_id')
      .eq('household_id', householdId)
      .eq('has_cooked', true);

    if (error) {
      console.error('Error getting cooked recipes list:', error);
      return [];
    }

    return data?.map(r => r.recipe_id) || [];
  }

  async getRecipeCookedCount(householdId: string, recipeId: string): Promise<number> {
    // Count how many times this recipe has been marked in completed meal plans
    const { count, error } = await supabase
      .from('household_meal_plans')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('recipe_id', recipeId)
      .eq('is_completed', true);

    if (error) {
      console.error('Error getting recipe cooked count:', error);
      return 0;
    }

    return count || 0;
  }

  async checkCompletedWeek(householdId: string, weekNumber: number): Promise<boolean> {
    // Get all meal plans for this week
    const { data: allMeals, error: allError } = await supabase
      .from('household_meal_plans')
      .select('id, is_completed')
      .eq('household_id', householdId)
      .eq('week_number', weekNumber);

    if (allError || !allMeals || allMeals.length === 0) {
      return false;
    }

    // Check if all meals are completed
    return allMeals.every(meal => meal.is_completed);
  }

  async hasOpenedChefInsight(userId: string): Promise<boolean> {
    // Check if user has any chat messages (indicates they've opened Chef's Insight)
    const { data, error } = await supabase
      .from('realichef_chat_messages')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking Chef Insight usage:', error);
      return false;
    }

    return !!data;
  }

  calculateProgress(current: number, required: number): AchievementProgress {
    const percentage = Math.min(100, Math.round((current / required) * 100));
    return {
      current,
      required,
      percentage
    };
  }
}

export const achievementService = new AchievementService();
