import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { achievementService, UserAchievement } from '@/services/achievementService';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import { Achievement } from '@/types/achievements';
import { ACHIEVEMENT_REQUIREMENTS } from '@/lib/achievementRequirements';
import { supabase } from '@/integrations/supabase/client';

export function useAchievements() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) {
      setUserAchievements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const achievements = await achievementService.getUserAchievements(user.id);
    setUserAchievements(achievements);
    setIsLoading(false);
  }, [user?.id, currentHousehold?.id]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Merge static achievement data with unlocked status and calculate progress
  const achievements: Achievement[] = ACHIEVEMENTS.map(achievement => {
    const userAchievement = userAchievements.find(
      ua => ua.achievement_id === achievement.id
    );

    return {
      ...achievement,
      isUnlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlocked_at || null
    };
  });

  // Calculate progress for locked achievements
  useEffect(() => {
    if (!currentHousehold?.id || !user?.id) return;

    const calculateProgress = async () => {
      // Get data for progress calculations
      const [cookedCount, hasChefInsight, recipeCount] = await Promise.all([
        achievementService.getCookedRecipeCount(currentHousehold.id),
        achievementService.hasOpenedChefInsight(user.id),
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('household_id', currentHousehold.id)
          .eq('is_deleted', false)
          .then(({ count }) => count || 0)
      ]);

      // Update achievements with progress
      achievements.forEach(achievement => {
        if (achievement.isUnlocked) return;

        const requirement = ACHIEVEMENT_REQUIREMENTS[achievement.id];
        if (!requirement) return;

        let current = 0;

        switch (requirement.type) {
          case 'cooked_count':
            current = cookedCount;
            break;
          case 'chef_insight':
            current = hasChefInsight ? 1 : 0;
            break;
          case 'recipe_count':
            current = recipeCount;
            break;
          default:
            return; // Skip achievements we can't track yet
        }

        const progress = achievementService.calculateProgress(current, requirement.required);
        achievement.progress = progress;
      });

      // Trigger re-render
      setUserAchievements([...userAchievements]);
    };

    calculateProgress();
  }, [currentHousehold?.id, user?.id, userAchievements.length]);

  return {
    achievements,
    isLoading,
    refetch: fetchAchievements
  };
}
