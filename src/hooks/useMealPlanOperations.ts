
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { MealType, MealPlan, Recipe } from "@/types";

export const useMealPlanOperations = (week: 1 | 2) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { 
    getMealPlansForWeek, 
    addMealPlan, 
    addMealPlanWithLeftovers,
    removeMealPlan, 
    clearWeek,
    reorderMealPlans
  } = useMealPlan();
  const { toast } = useToast();

  const getMealPlansForType = (mealType: MealType) =>
    getMealPlansForWeek(week).filter(plan => plan.mealType === mealType);

  const performRemoveMeal = async (planId: string) => {
    console.log("Removing meal plan:", planId);
    await removeMealPlan(planId);
    
    toast({
      title: "Meal Removed",
      description: "The meal has been removed from your plan.",
    });
  };

  const performAddMeal = async (mealType: MealType, recipeId: string, leftoverServings?: number, silentMode = false) => {
    if (!user || !currentHousehold) return;
    
    if (!silentMode) {
      console.log("Adding meal to plan:", { mealType, recipeId, week, leftoverServings });
    }
    
    const currentPlansForType = getMealPlansForType(mealType);
    
    try {
      const mealPlanData = {
        date: new Date().toISOString().split('T')[0],
        mealType,
        recipeId,
        createdBy: user.id,
        slotIndex: currentPlansForType.length,
        isLeftover: false,
        householdId: currentHousehold.id,
      };

      if (mealType === 'dinner' && leftoverServings) {
        await addMealPlanWithLeftovers(mealPlanData, week, leftoverServings, silentMode);
      } else {
        await addMealPlan(mealPlanData, week, silentMode);
      }
    } catch (error) {
      console.error("Error adding meal:", error);
      if (!silentMode) {
        toast({
          title: "Error",
          description: "Failed to add meal. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const performCreateLeftover = async (mealPlan: MealPlan, recipe: Recipe, servings: number) => {
    if (!user || !currentHousehold) return;
    
    try {
      const currentLunchPlans = getMealPlansForType('lunch');
      
      await addMealPlan({
        date: mealPlan.date,
        mealType: 'lunch',
        recipeId: mealPlan.recipeId,
        createdBy: user.id,
        slotIndex: currentLunchPlans.length,
        parentMealPlanId: mealPlan.id,
        isLeftover: true,
        leftoverServings: servings,
        originalServings: recipe.servings,
        householdId: currentHousehold.id,
      }, week);

      toast({
        title: "Leftover Lunch Added",
        description: `${servings} servings of ${recipe.title} scheduled for lunch leftovers.`,
      });
    } catch (error) {
      console.error("Error creating leftover:", error);
      toast({
        title: "Error",
        description: "Failed to create leftover. Please try again.",
        variant: "destructive",
      });
    }
  };

  const performClearAll = async () => {
    try {
      await clearWeek(week);
      toast({
        title: "Meal Plan Cleared",
        description: `Week ${week} meal plan has been cleared.`,
      });
    } catch (error) {
      console.error("Error clearing meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to clear meal plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const performReorderMeals = async (mealType: MealType, sourceIndex: number, destinationIndex: number) => {
    if (!user || !currentHousehold) return;

    const mealPlansForType = getMealPlansForType(mealType);
    
    if (sourceIndex < 0 || destinationIndex < 0 || 
        sourceIndex >= mealPlansForType.length || 
        destinationIndex >= mealPlansForType.length) {
      return;
    }

    try {
      await reorderMealPlans(mealType, week, sourceIndex, destinationIndex);
      
      toast({
        title: "Meals Reordered",
        description: `${mealType} meals have been reordered.`,
      });
    } catch (error) {
      console.error("Error reordering meals:", error);
      toast({
        title: "Error",
        description: "Failed to reorder meals. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateShareText = () => {
    const mealTypes = ["dinner", "lunch", "breakfast", "snacks"] as MealType[];
    let shareText = `Here's our shared meal plan for Week ${week}!\n\n`;
    
    mealTypes.forEach(mealType => {
      shareText += `--- ${mealType.toUpperCase()} ---\n`;
      getMealPlansForType(mealType).forEach(plan => {
        const recipe = recipes.find(r => r.id === plan.recipeId);
        const servingInfo = plan.isLeftover 
          ? ` (${plan.leftoverServings} leftover servings)`
          : ` (${plan.originalServings || recipe?.servings || 1} servings)`;
        const leftoverPrefix = plan.isLeftover ? "🍽️ " : "";
        shareText += `- ${leftoverPrefix}${recipe ? recipe.title : "Unknown"}${servingInfo}\n`;
      });
      shareText += "\n";
    });
    
    return shareText;
  };

  return {
    getMealPlansForType,
    performRemoveMeal,
    performAddMeal,
    performCreateLeftover,
    performClearAll,
    performReorderMeals,
    generateShareText,
  };
};
