import { useEffect } from 'react';
import { useAchievementChecker } from '@/hooks/useAchievementChecker';

export function AchievementListener() {
  const { 
    checkCookingAchievements, 
    checkFamilyFavourite,
    checkChefInsight,
    checkPerfectPlanner,
    checkRecipeCountAchievements
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

    const handleRecipeCountAchievements = () => {
      checkRecipeCountAchievements();
    };

    window.addEventListener('checkCookingAchievements', handleCookingAchievements);
    window.addEventListener('checkChefInsight', handleChefInsight);
    window.addEventListener('checkPerfectPlanner', handlePerfectPlanner);
    window.addEventListener('checkRecipeCountAchievements', handleRecipeCountAchievements);

    return () => {
      window.removeEventListener('checkCookingAchievements', handleCookingAchievements);
      window.removeEventListener('checkChefInsight', handleChefInsight);
      window.removeEventListener('checkPerfectPlanner', handlePerfectPlanner);
      window.removeEventListener('checkRecipeCountAchievements', handleRecipeCountAchievements);
    };
  }, [checkCookingAchievements, checkFamilyFavourite, checkChefInsight, checkPerfectPlanner, checkRecipeCountAchievements]);

  return null;
}
