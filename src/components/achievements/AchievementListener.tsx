import { useEffect } from 'react';
import { useAchievementChecker } from '@/hooks/useAchievementChecker';

export function AchievementListener() {
  const { 
    checkCookingAchievements, 
    checkFamilyFavourite,
    checkChefInsight,
    checkPerfectPlanner 
  } = useAchievementChecker();

  useEffect(() => {
    const handleCookingAchievements = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { recipeId } = customEvent.detail || {};
      
      checkCookingAchievements();
      if (recipeId) {
        checkFamilyFavourite(recipeId);
      }
    };

    const handleChefInsight = () => {
      checkChefInsight();
    };

    const handlePerfectPlanner = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { weekNumber } = customEvent.detail || {};
      if (weekNumber) {
        checkPerfectPlanner(weekNumber);
      }
    };

    window.addEventListener('checkCookingAchievements', handleCookingAchievements);
    window.addEventListener('checkChefInsight', handleChefInsight);
    window.addEventListener('checkPerfectPlanner', handlePerfectPlanner);

    return () => {
      window.removeEventListener('checkCookingAchievements', handleCookingAchievements);
      window.removeEventListener('checkChefInsight', handleChefInsight);
      window.removeEventListener('checkPerfectPlanner', handlePerfectPlanner);
    };
  }, [checkCookingAchievements, checkFamilyFavourite, checkChefInsight, checkPerfectPlanner]);

  return null;
}
