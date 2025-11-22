import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { achievementService } from '@/services/achievementService';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import { showAchievementToast } from '@/components/achievements/AchievementToast';

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

  // Recipe Achievements (8-22)
  const checkRecipeCreation = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    const recipeCount = await achievementService.getRecipeCount(userId, householdId);

    // Recipe Creator (8) - first recipe
    if (recipeCount >= 1) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '8',
        { recipeCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '8');
        if (achievement) showAchievementToast(achievement);
      }
    }

    // Recipe count milestones (13-15)
    const recipeMilestones = [
      { id: '13', count: 10, name: 'Recipe Collector' },
      { id: '14', count: 25, name: 'Recipe Master' },
      { id: '15', count: 50, name: 'Recipe Legend' }
    ];

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
          if (achievement) showAchievementToast(achievement);
        }
      }
    }
  }, [user?.id, currentHousehold?.id]);

  const checkImportMethodAchievements = useCallback(async (importMethod: string) => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    const methodMap: Record<string, string> = {
      'url': '9', // Web Whiz
      'image': '10', // Photo Feeder
      'ai': '11', // AI Chef
      'text': '12' // Meal Maestro (text import)
    };

    const achievementId = methodMap[importMethod];
    if (!achievementId) return;

    const count = await achievementService.getRecipeCountByImportMethod(userId, householdId, importMethod);
    if (count >= 1) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        achievementId,
        { importMethod, count }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (achievement) showAchievementToast(achievement);
      }
    }
  }, [user?.id, currentHousehold?.id]);

  const checkEdamamAchievements = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    const edamamCount = await achievementService.getEdamamImportCount(userId, householdId);

    const edamamMilestones = [
      { id: '16', count: 1, name: 'Taste Explorer' },
      { id: '17', count: 3, name: 'Flavour Hunter' },
      { id: '18', count: 5, name: 'Culinary Curator' },
      { id: '19', count: 10, name: 'Recipe Connoisseur' }
    ];

    for (const milestone of edamamMilestones) {
      if (edamamCount >= milestone.count) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          milestone.id,
          { edamamCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === milestone.id);
          if (achievement) showAchievementToast(achievement);
        }
      }
    }
  }, [user?.id, currentHousehold?.id]);

  const checkLeftoverAchievements = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    const leftoverCount = await achievementService.getLeftoverMealCount(householdId);

    // Leftovers Legend (20) - first leftover
    if (leftoverCount >= 1) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '20',
        { leftoverCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '20');
        if (achievement) showAchievementToast(achievement);
      }
    }

    // Zero Waste Warrior (21) - 3 leftovers in a week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekLeftoverCount = await achievementService.getLeftoverMealsInWeek(
      householdId,
      weekStart,
      weekEnd
    );

    if (weekLeftoverCount >= 3) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '21',
        { weekLeftoverCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '21');
        if (achievement) showAchievementToast(achievement);
      }
    }
  }, [user?.id, currentHousehold?.id]);

  const checkMealPrepAchievements = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    // Meal Prep Pro (22) - 5 meal plans (inferred from meal plan count)
    const mealPlanCount = await achievementService.getMealPlanCount(householdId);
    if (mealPlanCount >= 5) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '22',
        { mealPlanCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '22');
        if (achievement) showAchievementToast(achievement);
      }
    }
  }, [user?.id, currentHousehold?.id]);

  // Meal Planning Achievements (23-27)
  const checkMealPlanningAchievements = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    const mealPlanCount = await achievementService.getMealPlanCount(householdId);

    // Planning Pioneer (23) - first meal plan
    if (mealPlanCount >= 1) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '23',
        { mealPlanCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '23');
        if (achievement) showAchievementToast(achievement);
      }
    }

    // Calculate weeks with meal plans (simplified - using meal plan count as proxy)
    // Weekly Warrior (24) - 4 weeks
    if (mealPlanCount >= 4) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '24',
        { mealPlanCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '24');
        if (achievement) showAchievementToast(achievement);
      }
    }

    // Monthly Mastermind (25) - 12 weeks
    if (mealPlanCount >= 12) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '25',
        { mealPlanCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '25');
        if (achievement) showAchievementToast(achievement);
      }
    }
  }, [user?.id, currentHousehold?.id]);


  const checkMealPlanSharing = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    // Share the Plan (26) - triggered by event
    const unlocked = await achievementService.unlockAchievement(
      userId,
      householdId,
      '26',
      { shared: true }
    );
    if (unlocked) {
      const achievement = ACHIEVEMENTS.find(a => a.id === '26');
      if (achievement) showAchievementToast(achievement);
    }
  }, [user?.id, currentHousehold?.id]);

  // Shopping Achievements (27-32)
  const checkShoppingListAchievements = useCallback(async (action?: 'generated' | 'checked' | 'custom' | 'cleared' | 'shared') => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    if (action === 'generated') {
      // Budget Baker (27) - first shopping list
      const listCount = await achievementService.getShoppingListGenerationCount(householdId);
      if (listCount >= 1) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '27',
          { listCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '27');
          if (achievement) showAchievementToast(achievement);
        }
      }

      // List Lover (30) - 5 lists
      if (listCount >= 5) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '30',
          { listCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '30');
          if (achievement) showAchievementToast(achievement);
        }
      }

      // Share the Load (32) - 10 lists (using list count as proxy)
      if (listCount >= 10) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '32',
          { listCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '32');
          if (achievement) showAchievementToast(achievement);
        }
      }
    }

    if (action === 'checked') {
      // Smart Shopper (28) - 10 items checked
      const checkedCount = await achievementService.getShoppingListItemsCheckedCount(householdId);
      if (checkedCount >= 10) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '28',
          { checkedCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '28');
          if (achievement) showAchievementToast(achievement);
        }
      }
    }

    if (action === 'custom') {
      // Pantry Pro (29) - custom item added
      const customCount = await achievementService.getCustomShoppingItemsCount(householdId);
      if (customCount >= 1) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '29',
          { customCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '29');
          if (achievement) showAchievementToast(achievement);
        }
      }
    }

    if (action === 'cleared') {
      // Clear Conscience (31) - clear all clicked
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '31',
        { cleared: true }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '31');
        if (achievement) showAchievementToast(achievement);
      }
    }

    if (action === 'shared') {
      // Share the Load (32) - list shared
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '32',
        { shared: true }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '32');
        if (achievement) showAchievementToast(achievement);
      }
    }
  }, [user?.id, currentHousehold?.id]);

  // Engagement Achievements (33-36)
  const checkEngagementAchievements = useCallback(async (activityType?: 'page_visit' | 'login') => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    if (activityType === 'page_visit') {
      // Kitchen Explorer (33) - visit all main pages
      // This will be tracked via localStorage and checked when all pages visited
      const visitedPages = JSON.parse(localStorage.getItem('visited_pages') || '[]');
      const requiredPages = ['/', '/my-recipes', '/meal-planner', '/shopping-list', '/discover-recipes'];
      const allVisited = requiredPages.every(page => visitedPages.includes(page));

      if (allVisited) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '33',
          { visitedPages }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '33');
          if (achievement) showAchievementToast(achievement);
        }
      }
    }

    if (activityType === 'login') {
      // Daily Dash of Salt (34) - 5 consecutive days
      const loginDays = await achievementService.getConsecutiveLoginDays(userId);
      if (loginDays >= 5) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '34',
          { loginDays }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '34');
          if (achievement) showAchievementToast(achievement);
        }
      }

      // Stir Crazy (35) - 4 active weeks
      const activeWeeks = await achievementService.getActiveWeeksCount(userId, householdId);
      if (activeWeeks >= 4) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '35',
          { activeWeeks }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '35');
          if (achievement) showAchievementToast(achievement);
        }
      }

      // Kitchen Keeper (36) - 30 consecutive days
      if (loginDays >= 30) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '36',
          { loginDays }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '36');
          if (achievement) showAchievementToast(achievement);
        }
      }
    }
  }, [user?.id, currentHousehold?.id]);

  // Sustainability Achievements (37-38)
  const checkSustainabilityAchievements = useCallback(async () => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    const leftoverCount = await achievementService.getLeftoverMealCount(householdId);

    // Waste Watcher (37) - first leftover
    if (leftoverCount >= 1) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '37',
        { leftoverCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '37');
        if (achievement) showAchievementToast(achievement);
      }
    }

    // Zero Waste Week (38) - 3 leftovers in a week (same as achievement 21)
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekLeftoverCount = await achievementService.getLeftoverMealsInWeek(
      householdId,
      weekStart,
      weekEnd
    );

    if (weekLeftoverCount >= 3) {
      const unlocked = await achievementService.unlockAchievement(
        userId,
        householdId,
        '38',
        { weekLeftoverCount }
      );
      if (unlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === '38');
        if (achievement) showAchievementToast(achievement);
      }
    }
  }, [user?.id, currentHousehold?.id]);

  // Community Achievements (39-43)
  const checkCommunityAchievements = useCallback(async (action?: 'invite' | 'member_added' | 'recipe_added') => {
    if (!user?.id || !currentHousehold?.id) return;

    const householdId = currentHousehold.id;
    const userId = user.id;

    if (action === 'invite') {
      const inviteCount = await achievementService.getInvitationCount(userId);

      // Dinner's Better Together (39) - first invite
      if (inviteCount >= 1) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '39',
          { inviteCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '39');
          if (achievement) showAchievementToast(achievement);
        }
      }

      // The Generous Host (41) - 5 invites
      if (inviteCount >= 5) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '41',
          { inviteCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '41');
          if (achievement) showAchievementToast(achievement);
        }
      }

      // Mealfluencer (43) - 10 invites
      if (inviteCount >= 10) {
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '43',
          { inviteCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '43');
          if (achievement) showAchievementToast(achievement);
        }
      }
    }

    if (action === 'member_added') {
      const memberCount = await achievementService.getHouseholdMemberCount(householdId);

      // Sunday Roast Crew (40) - all members have recipes
      // This is checked when a member adds a recipe
      if (memberCount >= 2) {
        // Check if all members have at least one recipe
        // This would need additional logic, simplified for now
        const unlocked = await achievementService.unlockAchievement(
          userId,
          householdId,
          '40',
          { memberCount }
        );
        if (unlocked) {
          const achievement = ACHIEVEMENTS.find(a => a.id === '40');
          if (achievement) showAchievementToast(achievement);
        }
      }
    }

    // Kitchen Connector (42) - second-generation invite
    // This would need to track invitation chains, simplified for now
    if (action === 'invite') {
      // Check if this invite was from someone you invited
      // This requires additional tracking logic
    }
  }, [user?.id, currentHousehold?.id]);


  return {
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
  };
}
