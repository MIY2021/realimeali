import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { achievementService, UserAchievement } from '@/services/achievementService';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import { Achievement } from '@/types/achievements';

export function useAchievements() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user?.id) {
      setUserAchievements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const achievements = await achievementService.getUserAchievements(user.id);
    setUserAchievements(achievements);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Merge static achievement data with unlocked status
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

  return {
    achievements,
    isLoading,
    refetch: fetchAchievements
  };
}
