import { useEffect } from 'react';
import { useAchievementChecker } from '@/hooks/useAchievementChecker';

export function AchievementListener() {
  const { 
    checkCookingAchievements, 
    checkFamilyFavourite,
    checkChefInsight,
    checkPerfectPlanner,
    checkRecipeCreation,
    checkImportMethodAchievements,
    checkEdamamAchievements,
    checkLeftoverAchievements,
    checkMealPrepAchievements,
    checkMealPlanningAchievements,
    checkMealPlanSharing,
    checkShoppingListAchievements,
    checkEngagementAchievements,
    checkSustainabilityAchievements,
    checkCommunityAchievements
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

    const handleRecipeCreation = () => {
      checkRecipeCreation();
    };

    const handleImportMethodAchievements = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { importMethod } = customEvent.detail || {};
      if (importMethod) {
        checkImportMethodAchievements(importMethod);
      }
    };

    const handleEdamamAchievements = () => {
      checkEdamamAchievements();
    };

    const handleLeftoverAchievements = () => {
      checkLeftoverAchievements();
    };

    const handleMealPrepAchievements = () => {
      checkMealPrepAchievements();
    };

    const handleMealPlanningAchievements = () => {
      checkMealPlanningAchievements();
    };

    const handleMealPlanSharing = () => {
      checkMealPlanSharing();
    };

    const handleShoppingListAchievements = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action } = customEvent.detail || {};
      checkShoppingListAchievements(action);
    };

    const handleEngagementAchievements = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { activityType } = customEvent.detail || {};
      checkEngagementAchievements(activityType);
    };

    const handleSustainabilityAchievements = () => {
      checkSustainabilityAchievements();
    };

    const handleCommunityAchievements = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action } = customEvent.detail || {};
      checkCommunityAchievements(action);
    };

    window.addEventListener('checkCookingAchievements', handleCookingAchievements);
    window.addEventListener('checkChefInsight', handleChefInsight);
    window.addEventListener('checkPerfectPlanner', handlePerfectPlanner);
    window.addEventListener('checkRecipeCreation', handleRecipeCreation);
    window.addEventListener('checkImportMethodAchievements', handleImportMethodAchievements);
    window.addEventListener('checkEdamamAchievements', handleEdamamAchievements);
    window.addEventListener('checkLeftoverAchievements', handleLeftoverAchievements);
    window.addEventListener('checkMealPrepAchievements', handleMealPrepAchievements);
    window.addEventListener('checkMealPlanningAchievements', handleMealPlanningAchievements);
    window.addEventListener('checkMealPlanSharing', handleMealPlanSharing);
    window.addEventListener('checkShoppingListAchievements', handleShoppingListAchievements);
    window.addEventListener('checkEngagementAchievements', handleEngagementAchievements);
    window.addEventListener('checkSustainabilityAchievements', handleSustainabilityAchievements);
    window.addEventListener('checkCommunityAchievements', handleCommunityAchievements);

    return () => {
      window.removeEventListener('checkCookingAchievements', handleCookingAchievements);
      window.removeEventListener('checkChefInsight', handleChefInsight);
      window.removeEventListener('checkPerfectPlanner', handlePerfectPlanner);
      window.removeEventListener('checkRecipeCreation', handleRecipeCreation);
      window.removeEventListener('checkImportMethodAchievements', handleImportMethodAchievements);
      window.removeEventListener('checkEdamamAchievements', handleEdamamAchievements);
      window.removeEventListener('checkLeftoverAchievements', handleLeftoverAchievements);
      window.removeEventListener('checkMealPrepAchievements', handleMealPrepAchievements);
      window.removeEventListener('checkMealPlanningAchievements', handleMealPlanningAchievements);
      window.removeEventListener('checkMealPlanSharing', handleMealPlanSharing);
      window.removeEventListener('checkShoppingListAchievements', handleShoppingListAchievements);
      window.removeEventListener('checkEngagementAchievements', handleEngagementAchievements);
      window.removeEventListener('checkSustainabilityAchievements', handleSustainabilityAchievements);
      window.removeEventListener('checkCommunityAchievements', handleCommunityAchievements);
    };
  }, [
    checkCookingAchievements, 
    checkFamilyFavourite, 
    checkChefInsight, 
    checkPerfectPlanner,
    checkRecipeCreation,
    checkImportMethodAchievements,
    checkEdamamAchievements,
    checkLeftoverAchievements,
    checkMealPrepAchievements,
    checkMealPlanningAchievements,
    checkMealPlanSharing,
    checkShoppingListAchievements,
    checkEngagementAchievements,
    checkSustainabilityAchievements,
    checkCommunityAchievements
  ]);

  return null;
}
