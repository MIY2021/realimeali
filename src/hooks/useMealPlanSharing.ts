import { useCallback } from "react";
import { MealPlan, Recipe } from "@/types";

interface UseMealPlanSharingProps {
  user: any;
  currentHousehold: any;
  currentWeek: 1 | 2;
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
    if (!mealPlans.length || !recipes.length) {
      return `Week ${currentWeek} Meal Plan\n\nNo meals planned for this week.`;
    }

    // Group meal plans by meal type
    const mealsByType: { [key: string]: MealPlan[] } = {};
    const weekPlans = mealPlans.filter(plan => plan.week_number === currentWeek);
    
    weekPlans.forEach(plan => {
      if (!mealsByType[plan.meal_type]) {
        mealsByType[plan.meal_type] = [];
      }
      mealsByType[plan.meal_type].push(plan);
    });

    // Format text
    let text = `Week ${currentWeek} Meal Plan\n\n`;
    
    const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snacks', 'sides', 'desserts', 'drinks'];
    const mealTypeLabels: { [key: string]: string } = {
      breakfast: 'Breakfast',
      lunch: 'Lunch', 
      dinner: 'Dinner',
      snacks: 'Snacks',
      sides: 'Sides',
      desserts: 'Desserts',
      drinks: 'Drinks'
    };

    mealTypeOrder.forEach(mealType => {
      const plans = mealsByType[mealType];
      if (plans && plans.length > 0) {
        text += `${mealTypeLabels[mealType]}:\n`;
        
        plans.forEach(plan => {
          const recipe = recipes.find(r => r.id === plan.recipe_id);
          if (recipe) {
            let recipeName = recipe.title;
            if (plan.is_leftover) {
              recipeName += ` (Leftover - ${plan.leftover_servings || 1} servings)`;
            }
            text += `• ${recipeName}\n`;
          }
        });
        text += '\n';
      }
    });
    
    return text;
  }, [currentWeek, mealPlans, recipes]);

  const handleShare = useCallback(async () => {
    const mealPlanText = formatMealPlanText();
    const shareTitle = `Week ${currentWeek} Meal Plan`;
    const shareUrl = `${window.location.origin}/meal-planner`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: mealPlanText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard with formatted text including URL
      const textWithUrl = `${mealPlanText}\n\nView and edit this meal plan: ${shareUrl}`;
      try {
        await navigator.clipboard.writeText(textWithUrl);
        toast({
          title: "Meal Plan Copied",
          description: `Week ${currentWeek} meal plan copied to clipboard`,
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
    
    // Use the dialog if available, otherwise fallback to confirm
    if (setClearAllDialog) {
      setClearAllDialog(true);
    } else {
      const confirmed = window.confirm(`Are you sure you want to clear all meals for week ${currentWeek}?`);
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
        description: `All meals cleared for week ${currentWeek}`,
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
