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
  }, [fetchAchievements]);

  // Calculate achievements with progress in a single pass
  useEffect(() => {
    if (!user?.id || !currentHousehold?.id) {
      setAchievements([]);
      return;
    }

    const calculateAchievementsWithProgress = async () => {
      // Fetch all data needed for progress calculations
      const [
        cookedCount,
        hasChefInsight,
        recipeCount,
        urlImportCount,
        imageImportCount,
        aiImportCount,
        textImportCount,
        edamamCount,
        shoppingListCount,
        checkedItemsCount,
        customItemsCount,
        mealPlanCount,
        freestyleCount,
        leftoverCount,
        favoriteCount,
        loginDays,
        activeWeeks,
        memberCount,
        inviteCount
      ] = await Promise.all([
        achievementService.getCookedRecipeCount(currentHousehold.id),
        achievementService.hasOpenedChefInsight(user.id),
        achievementService.getRecipeCount(user.id, currentHousehold.id),
        achievementService.getRecipeCountByImportMethod(user.id, currentHousehold.id, 'url'),
        achievementService.getRecipeCountByImportMethod(user.id, currentHousehold.id, 'image'),
        achievementService.getRecipeCountByImportMethod(user.id, currentHousehold.id, 'ai'),
        achievementService.getRecipeCountByImportMethod(user.id, currentHousehold.id, 'text'),
        achievementService.getEdamamImportCount(user.id, currentHousehold.id),
        achievementService.getShoppingListGenerationCount(currentHousehold.id),
        achievementService.getShoppingListItemsCheckedCount(currentHousehold.id),
        achievementService.getCustomShoppingItemsCount(currentHousehold.id),
        achievementService.getMealPlanCount(currentHousehold.id),
        achievementService.getFreestyleMealCount(currentHousehold.id),
        achievementService.getLeftoverMealCount(currentHousehold.id),
        achievementService.getFavoriteRecipesCount(user.id, currentHousehold.id),
        achievementService.getConsecutiveLoginDays(user.id).catch(() => 0),
        achievementService.getActiveWeeksCount(user.id, currentHousehold.id).catch(() => 0),
        achievementService.getHouseholdMemberCount(currentHousehold.id),
        achievementService.getInvitationCount(user.id)
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
              case 'other':
                // Handle "other" type achievements based on achievement ID
                switch (achievement.id) {
                  // Import method achievements
                  case '9': // Web Whiz
                    current = urlImportCount;
                    break;
                  case '10': // Photo Feeder
                    current = imageImportCount;
                    break;
                  case '11': // AI Chef
                    current = aiImportCount;
                    break;
                  case '12': // Meal Maestro
                    current = textImportCount;
                    break;
                  // Edamam achievements
                  case '16': // Taste Explorer
                  case '17': // Flavour Hunter
                  case '18': // Culinary Curator
                  case '19': // Recipe Connoisseur
                    current = edamamCount;
                    break;
                  // Leftover achievements
                  case '20': // Leftovers Legend
                  case '37': // Waste Watcher
                    current = leftoverCount;
                    break;
                  // Meal planning achievements
                  case '23': // Planning Pioneer
                  case '24': // Weekly Warrior
                  case '25': // Monthly Mastermind
                    current = mealPlanCount;
                    break;
                  // Shopping achievements
                  case '27': // Budget Baker
                  case '30': // List Lover
                  case '32': // Share the Load
                    current = shoppingListCount;
                    break;
                  case '28': // Smart Shopper
                    current = checkedItemsCount;
                    break;
                  case '29': // Pantry Pro
                    current = customItemsCount;
                    break;
                  // Engagement achievements
                  case '34': // Daily Dash of Salt
                  case '36': // Kitchen Keeper
                    current = loginDays;
                    break;
                  case '35': // Stir Crazy
                    current = activeWeeks;
                    break;
                  // Community achievements
                  case '39': // Dinner's Better Together
                  case '41': // The Generous Host
                  case '43': // Mealfluencer
                    current = inviteCount;
                    break;
                  case '40': // Sunday Roast Crew
                    current = memberCount;
                    break;
                  default:
                    // For achievements we can't calculate progress, return base achievement
                    return baseAchievement;
                }
                break;
              default:
                return baseAchievement;
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
