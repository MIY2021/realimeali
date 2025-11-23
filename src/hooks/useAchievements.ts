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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
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
    
    // Check recipe count achievements on page load for retroactive unlock
    window.dispatchEvent(new CustomEvent('checkRecipeCountAchievements'));
  }, [fetchAchievements]);

  // Calculate achievements with progress in a single pass
  useEffect(() => {
    if (!user?.id || !currentHousehold?.id) {
      setAchievements([]);
      return;
    }

    const calculateAchievementsWithProgress = async () => {
      // Fetch all data needed for progress calculations
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

      // Create achievements with unlocked status AND progress in one pass
      const achievementsWithProgress = ACHIEVEMENTS.map(achievement => {
        const userAchievement = userAchievements.find(
          ua => ua.achievement_id === achievement.id
        );

        const baseAchievement = {
          ...achievement,
          isUnlocked: !!userAchievement,
          unlockedAt: userAchievement?.unlocked_at || null
        };

        // Only calculate progress for locked achievements
        if (!baseAchievement.isUnlocked) {
          const requirement = ACHIEVEMENT_REQUIREMENTS[achievement.id];
          if (requirement) {
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
                return baseAchievement; // Skip achievements we can't track yet
            }

            const progress = achievementService.calculateProgress(current, requirement.required);
            return {
              ...baseAchievement,
              progress
            };
          }
        }

        return baseAchievement;
      });

      setAchievements(achievementsWithProgress);
    };

    calculateAchievementsWithProgress();
  }, [user?.id, currentHousehold?.id, userAchievements]);

  return {
    achievements,
    isLoading,
    refetch: fetchAchievements
  };
}
