import { useCallback } from "react";
import { MealPlan, Recipe } from "@/types";
import { parseISOWeekKey, formatWeekRange } from "@/utils/weekUtils";

interface UseMealPlanSharingProps {
  user: any;
  currentHousehold: any;
  currentWeek: string; // ISO week key
  clearWeek: any;
  setIsLoading: (loading: boolean) => void;
  setClearAllDialog?: (open: boolean) => void;
  toast: any;
  mealPlans?: MealPlan[];
  recipes?: Recipe[];
}

export const useMealPlanSharing = ({
  user,
  currentHousehold,
  currentWeek,
  clearWeek,
  setIsLoading,
  setClearAllDialog,
  toast,
  mealPlans = [],
  recipes = [],
}: UseMealPlanSharingProps) => {

  const formatMealPlanText = useCallback(() => {
    const weekPlans = mealPlans.filter(plan => plan.week_key === currentWeek);

    const { year, week } = parseISOWeekKey(currentWeek);
    const weekRange = formatWeekRange(year, week);

    if (!weekPlans.length) {
      return `🍽️ RealiMeali Meal Plan
Week of ${weekRange}

No meals planned for this week.`;
    }

    // Group meal plans by meal type while preserving the planner's structure.
    const mealsByType: { [key: string]: MealPlan[] } = {};
    weekPlans.forEach(plan => {
      if (!mealsByType[plan.meal_type]) {
        mealsByType[plan.meal_type] = [];
      }
      mealsByType[plan.meal_type].push(plan);
    });

    const mealTypeOrder = ['dinner', 'lunch', 'breakfast', 'snacks', 'sides', 'desserts', 'drinks'];
    const mealTypeLabels: { [key: string]: string } = {
      dinner: '🍽️ Dinner',
      lunch: '🥗 Lunch',
      breakfast: '🥞 Breakfast',
      snacks: '🍿 Snacks',
      sides: '🥬 Sides',
      desserts: '🍰 Desserts',
      drinks: '🥤 Drinks',
    };

    let text = `🍽️ RealiMeali Meal Plan
Week of ${weekRange}

`;

    mealTypeOrder.forEach(mealType => {
      const plans = mealsByType[mealType];
      if (!plans?.length) return;

      text += `${mealTypeLabels[mealType]}:
`;

      plans.forEach(plan => {
        // Recipe-backed meals use the recipe title.
        const recipe = plan.recipe_id
          ? recipes.find(r => r.id === plan.recipe_id)
          : undefined;

        // Freetyped/custom meals have their name stored directly on the plan.
        let mealName = recipe?.title || plan.meal_name || 'Custom meal';

        if (plan.is_leftover) {
          mealName += ` (Leftover - ${plan.leftover_servings || 1} servings)`;
        }

        text += `• ${mealName}
`;
      });

      text += '\n';
    });

    return text.trim();
  }, [currentWeek, mealPlans, recipes]);

  const handleShare = useCallback(async () => {
    const mealPlanText = formatMealPlanText();
    const { year, week } = parseISOWeekKey(currentWeek);
    const weekRange = formatWeekRange(year, week);
    const shareTitle = `RealiMeali Meal Plan - Week of ${weekRange}`;

    // Preserve the exact week being shared when the recipient opens RealiMeali.
    const shareUrl = `${window.location.origin}/meal-planner?week=${encodeURIComponent(currentWeek)}`;
    const textWithUrl = `${mealPlanText}

View and edit this meal plan:
${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: textWithUrl,
        });
      } catch (err) {
        // User cancellation is normal and should not show an error.
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(textWithUrl);
        toast({
          title: "Meal Plan Copied",
          description: "Meal plan copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Share",
          description: "Share functionality not available",
        });
      }
    }
  }, [currentWeek, formatMealPlanText, toast]);

  const handleClearAll = useCallback(() => {
    if (!user || !currentHousehold) return;

    if (setClearAllDialog) {
      setClearAllDialog(true);
    } else {
      const confirmed = window.confirm(`Are you sure you want to clear all meals for this week?`);
      if (confirmed) {
        performClearAll();
      }
    }
  }, [user, currentHousehold, currentWeek, setClearAllDialog]);

  const performClearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      await clearWeek(currentWeek);
      toast({
        title: "Week Cleared",
        description: `All meals cleared for this week`,
      });
    } catch (err) {
      console.error("Error clearing week:", err);
      toast({
        title: "Error",
        description: "Failed to clear week",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, currentWeek, clearWeek, setIsLoading, toast]);

  return {
    handleShare,
    handleClearAll,
    performClearAll,
  };
};
