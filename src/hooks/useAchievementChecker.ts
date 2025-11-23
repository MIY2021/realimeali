import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { achievementService } from '@/services/achievementService';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import { showAchievementToast } from '@/components/achievements/AchievementToast';
import { supabase } from '@/integrations/supabase/client';

export function useAchievementChecker() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const checkCookingAchievements = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    // Get cooked recipe count
    const cookedCount = await achievementService.getCookedRecipeCount(householdId);

    // Define cooking achievements with their thresholds
    const cookingMilestones = [
      { id: '1', count: 1, name: 'First Bite' },
      { id: '2', count: 5, name: 'Home Hero' },
      { id: '3', count: 10, name: 'Kitchen Regular' },
      { id: '4', count: 25, name: 'Head Chef' }
    ];

    // Check each milestone
    for (const milestone of cookingMilestones) {
      if (cookedCount >= milestone.count) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          milestone.id,
          { cookedCount }
        );

        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === milestone.id);
          if (achievement) {
            showAchievementToast(achievement);
          }
        }
      }
    }
  }, [user?.id, currentHousehold?.id]);

  const checkFamilyFavourite = useCallback(async (recipeId: string) => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    // Check how many times this recipe has been cooked
    const cookedCount = await achievementService.getRecipeCookedCount(householdId, recipeId);

    if (cookedCount >= 3) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '6', // Family Favourite achievement ID
        { recipeId, cookedCount }
      );

      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '6');
        if (achievement) {
          showAchievementToast(achievement);
        }
      }
    }
  }, [user?.id, currentHousehold?.id]);

  const checkChefInsight = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const hasOpened = await achievementService.hasOpenedChefInsight(user.id);

    if (hasOpened) {
      const unlocked = await achievementService.unlockAchievement(
        user.id,
        currentHousehold.id,
        '5' // Chef's Whispers achievement ID
      );

      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '5');
        if (achievement) {
          showAchievementToast(achievement);
        }
      }
    }
  }, [user?.id, currentHousehold?.id]);

  const checkPerfectPlanner = useCallback(async (weekNumber: number) => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    // Check if all meals in the week are completed
    const isWeekComplete = await achievementService.checkCompletedWeek(householdId, weekNumber);

    if (isWeekComplete) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '7', // Perfect Planner achievement ID
        { weekNumber }
      );

      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '7');
        if (achievement) {
          showAchievementToast(achievement);
        }
      }
    }
  }, [user?.id, currentHousehold?.id]);

  const checkRecipeCountAchievements = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    // Get total recipe count for household
    const { count } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_deleted', false);

    const recipeCount = count || 0;

    // Define recipe count milestones
    const recipeMilestones = [
      { id: '8', count: 1, name: 'Recipe Creator' },
      { id: '13', count: 10, name: 'Recipe Collector' },
      { id: '14', count: 25, name: 'Recipe Master' },
      { id: '15', count: 50, name: 'Recipe Legend' }
    ];

    // Check each milestone
    for (const milestone of recipeMilestones) {
      if (recipeCount >= milestone.count) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          milestone.id,
          { recipeCount }
        );

        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === milestone.id);
          if (achievement) {
            showAchievementToast(achievement);
          }
        }
      }
    }
  }, [user?.id, currentHousehold?.id]);

  return {
    checkCookingAchievements,
    checkFamilyFavourite,
    checkChefInsight,
    checkPerfectPlanner,
    checkRecipeCountAchievements
  };
}
