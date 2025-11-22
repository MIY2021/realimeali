import { useEffect } from 'react';
import { useAchievementChecker } from '@/hooks/useAchievementChecker';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { supabase } from '@/integrations/supabase/client';

export function AchievementListener() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
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

  // Retroactive achievement checking - runs once per session on mount
  useEffect(() => {
    // Only run retroactive check once when user and household are available
    if (!user?.id || !currentHousehold?.id) return;

    // Use a flag to ensure we only run this once per session
    const retroactiveCheckKey = `retroactive_check_${user.id}_${currentHousehold.id}`;
    const hasRun = sessionStorage.getItem(retroactiveCheckKey);
    
    if (hasRun) return; // Already checked this session

    // Run all achievement checks retroactively after a short delay
    // to ensure data is loaded
    const timeoutId = setTimeout(async () => {
      try {
        // Check all achievement categories
        await checkCookingAchievements();
        await checkChefInsight();
        await checkRecipeCreation();
        await checkEdamamAchievements();
        await checkLeftoverAchievements();
        await checkMealPrepAchievements();
        await checkMealPlanningAchievements();
        
        // Check shopping list achievements
        await checkShoppingListAchievements('generated');
        
        // Check engagement achievements
        await checkEngagementAchievements('login');
        
        // Check sustainability achievements
        await checkSustainabilityAchievements();
        
        // Check community achievements
        await checkCommunityAchievements('invite');
        
        // Check import methods by querying existing recipes
        const { data: recipes } = await supabase
          .from('recipes')
          .select('import_method')
          .eq('user_id', user.id)
          .eq('household_id', currentHousehold.id)
          .is('deleted_at', null)
          .not('import_method', 'is', null);

        if (recipes) {
          const importMethods = new Set(recipes.map(r => r.import_method).filter(Boolean));
          for (const method of importMethods) {
            await checkImportMethodAchievements(method);
          }
        }
        
        // Mark as checked for this session
        sessionStorage.setItem(retroactiveCheckKey, 'true');
      } catch (error) {
        console.error('Error running retroactive achievement checks:', error);
      }
    }, 3000); // Wait 3 seconds for data to load

    return () => clearTimeout(timeoutId);
  }, [user?.id, currentHousehold?.id, 
      checkCookingAchievements, 
      checkChefInsight, 
      checkRecipeCreation,
      checkImportMethodAchievements,
      checkEdamamAchievements,
      checkLeftoverAchievements,
      checkMealPrepAchievements,
      checkMealPlanningAchievements,
      checkShoppingListAchievements,
      checkEngagementAchievements,
      checkSustainabilityAchievements,
      checkCommunityAchievements]);

  return null;
}
