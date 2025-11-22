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
    // Count distinct recipes that have been completed in meal plans
    const { data, error } = await supabase
      .from('household_meal_plans')
      .select('recipe_id')
      .eq('household_id', householdId)
      .eq('is_completed', true)
      .not('recipe_id', 'is', null);

    if (error) {
      console.error('Error getting cooked recipe count:', error);
      return 0;
    }

    // Get unique recipe IDs
    const uniqueRecipeIds = new Set(data?.map(m => m.recipe_id) || []);
    return uniqueRecipeIds.size;
  }

  async getCookedRecipesList(householdId: string): Promise<string[]> {
    // Get distinct recipes that have been completed in meal plans
    const { data, error } = await supabase
      .from('household_meal_plans')
      .select('recipe_id')
      .eq('household_id', householdId)
      .eq('is_completed', true)
      .not('recipe_id', 'is', null);

    if (error) {
      console.error('Error getting cooked recipes list:', error);
      return [];
    }

    // Get unique recipe IDs
    const uniqueRecipeIds = [...new Set(data?.map(m => m.recipe_id) || [])];
    return uniqueRecipeIds;
  }

  async getRecipeCookedCount(householdId: string, recipeId: string): Promise<number> {
    // Count how many times this recipe has been completed in meal plans
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

  // Recipe tracking methods
  async getRecipeCount(userId: string, householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('household_id', householdId)
      .is('deleted_at', null);

    if (error) {
      console.error('Error getting recipe count:', error);
      return 0;
    }

    return count || 0;
  }

  async getRecipeCountByImportMethod(userId: string, householdId: string, method: string): Promise<number> {
    const { count, error } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('household_id', householdId)
      .eq('import_method', method)
      .is('deleted_at', null);

    if (error) {
      console.error('Error getting recipe count by import method:', error);
      return 0;
    }

    return count || 0;
  }

  async getEdamamImportCount(userId: string, householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('imported_recipes')
      .select('*', { count: 'exact', head: true })
      .eq('imported_by', userId)
      .eq('household_id', householdId);

    if (error) {
      console.error('Error getting Edamam import count:', error);
      return 0;
    }

    return count || 0;
  }

  // Shopping list tracking methods
  async getShoppingListGenerationCount(householdId: string): Promise<number> {
    // Count distinct weeks where shopping lists were generated
    const { data, error } = await supabase
      .from('household_shopping_lists')
      .select('week_number')
      .eq('household_id', householdId)
      .not('week_number', 'is', null);

    if (error) {
      console.error('Error getting shopping list generation count:', error);
      return 0;
    }

    const uniqueWeeks = new Set(data?.map(item => item.week_number) || []);
    return uniqueWeeks.size;
  }

  async getShoppingListItemsCheckedCount(householdId: string, weekNumber?: number): Promise<number> {
    let query = supabase
      .from('household_shopping_lists')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_checked', true);

    if (weekNumber) {
      query = query.eq('week_number', weekNumber);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error getting checked shopping items count:', error);
      return 0;
    }

    return count || 0;
  }

  async getCustomShoppingItemsCount(householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('household_shopping_lists')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .is('recipe_id', null)
      .is('source_ingredients', null);

    if (error) {
      console.error('Error getting custom shopping items count:', error);
      return 0;
    }

    return count || 0;
  }

  // Meal planning tracking methods
  async getMealPlanCount(householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('household_meal_plans')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId);

    if (error) {
      console.error('Error getting meal plan count:', error);
      return 0;
    }

    return count || 0;
  }

  async getFreestyleMealCount(householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('household_meal_plans')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .is('recipe_id', null)
      .not('meal_name', 'is', null);

    if (error) {
      console.error('Error getting freestyle meal count:', error);
      return 0;
    }

    return count || 0;
  }

  async getLeftoverMealCount(householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('household_meal_plans')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_leftover', true);

    if (error) {
      console.error('Error getting leftover meal count:', error);
      return 0;
    }

    return count || 0;
  }

  async getLeftoverMealsInWeek(householdId: string, startDate: Date, endDate: Date): Promise<number> {
    const { data, error } = await supabase
      .from('household_meal_plans')
      .select('id')
      .eq('household_id', householdId)
      .eq('is_leftover', true)
      .eq('is_completed', true)
      .gte('meal_date', startDate.toISOString().split('T')[0])
      .lte('meal_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error getting leftover meals in week:', error);
      return 0;
    }

    return data?.length || 0;
  }

  // Favorite recipes tracking
  async getFavoriteRecipesCount(userId: string, householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('household_id', householdId)
      .eq('is_favorite', true)
      .is('deleted_at', null);

    if (error) {
      console.error('Error getting favorite recipes count:', error);
      return 0;
    }

    return count || 0;
  }

  // Activity tracking methods
  async recordLogin(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Try database first, fallback to localStorage
    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .upsert({
          user_id: userId,
          activity_date: today,
          activity_type: 'login',
          activity_count: 1
        }, {
          onConflict: 'user_id,activity_date,activity_type',
          ignoreDuplicates: false
        });

      if (error && error.code !== '23505') {
        // Fallback to localStorage if table doesn't exist
        this.recordLoginLocalStorage(userId, today);
      }
    } catch (error) {
      // Table doesn't exist, use localStorage
      this.recordLoginLocalStorage(userId, today);
    }
  }

  private recordLoginLocalStorage(userId: string, date: string): void {
    const key = `activity_${userId}`;
    const activities = JSON.parse(localStorage.getItem(key) || '{}');
    if (!activities[date]) {
      activities[date] = {};
    }
    if (!activities[date]['login']) {
      activities[date]['login'] = 0;
    }
    activities[date]['login']++;
    localStorage.setItem(key, JSON.stringify(activities));
  }

  async recordActivity(userId: string, householdId: string, activityType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('user_activity_logs')
      .upsert({
        user_id: userId,
        household_id: householdId,
        activity_date: today,
        activity_type: activityType,
        activity_count: 1
      }, {
        onConflict: 'user_id,household_id,activity_date,activity_type',
        ignoreDuplicates: false
      });

    if (error && error.code !== '23505') {
      console.error('Error recording activity:', error);
    }
  }

  async getConsecutiveLoginDays(userId: string): Promise<number> {
    // Try database first
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('activity_date')
        .eq('user_id', userId)
        .eq('activity_type', 'login')
        .order('activity_date', { ascending: false });

      if (!error && data) {
        return this.calculateConsecutiveDays(data.map(d => d.activity_date));
      }
    } catch (error) {
      // Table doesn't exist, use localStorage
    }

    // Fallback to localStorage
    const key = `activity_${userId}`;
    const activities = JSON.parse(localStorage.getItem(key) || '{}');
    const loginDates = Object.keys(activities).filter(date => activities[date]['login'] > 0);
    return this.calculateConsecutiveDays(loginDates);
  }

  private calculateConsecutiveDays(dates: string[]): number {
    if (!dates || dates.length === 0) return 0;

    let consecutiveDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDates = [...new Set(dates)].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      date.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (date.getTime() === expectedDate.getTime()) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays;
  }

  async getActiveWeeksCount(userId: string, householdId: string): Promise<number> {
    // Count distinct weeks where user had activity (recipes, meal plans, etc.)
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('activity_date')
      .eq('user_id', userId)
      .eq('household_id', householdId)
      .not('activity_date', 'is', null);

    if (error) {
      console.error('Error getting active weeks count:', error);
      return 0;
    }

    if (!data || data.length === 0) return 0;

    // Group by week (ISO week)
    const weeks = new Set<string>();
    data.forEach(item => {
      const date = new Date(item.activity_date);
      const week = this.getISOWeek(date);
      weeks.add(week);
    });

    return weeks.size;
  }

  private getISOWeek(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return `${d.getUTCFullYear()}-W${String(Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)).padStart(2, '0')}`;
  }

  // Community tracking methods
  async getHouseholdMemberCount(householdId: string): Promise<number> {
    const { count, error } = await supabase
      .from('household_members')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('status', 'active');

    if (error) {
      console.error('Error getting household member count:', error);
      return 0;
    }

    return count || 0;
  }

  async getInvitationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('household_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('invited_by', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error getting invitation count:', error);
      return 0;
    }

    return count || 0;
  }

  async getActivityHistory(userId: string, householdId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('household_id', householdId)
      .order('activity_date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error getting activity history:', error);
      return [];
    }

    return data || [];
  }
}

export const achievementService = new AchievementService();
