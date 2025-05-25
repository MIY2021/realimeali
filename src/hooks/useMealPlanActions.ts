
import { useState } from "react";
import { MealType, RecipeCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";

export const useMealPlanActions = (week: 1 | 2) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { 
    getMealPlansForWeek, 
    addMealPlan, 
    addMealPlanWithLeftovers,
    removeMealPlan, 
    clearWeek 
  } = useMealPlan();
  const { toast } = useToast();

  const [addMealModal, setAddMealModal] = useState<{
    open: boolean;
    mealType: MealType | null;
  }>({ open: false, mealType: null });

  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];
  
  const mealTypeToCategories: Record<MealType, RecipeCategory[]> = {
    dinner: ["Bulk", "Pasta", "Fish", "BBQ", "Super Tasty"],
    lunch: ["Easy", "Cheap", "Vegetarian", "Tapas"],
    breakfast: ["Breakfast", "Easy", "Healthy"],
    snacks: ["Snacks"],
  };

  const getMealPlansForType = (mealType: MealType) =>
    getMealPlansForWeek(week).filter(plan => plan.mealType === mealType);

  const handleRemoveMeal = async (planId: string) => {
    console.log("Removing meal plan:", planId);
    await removeMealPlan(planId);
  };

  const handleAddMeal = (mealType: MealType) => {
    console.log("Opening add meal modal for:", mealType);
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to add meals.",
        variant: "destructive",
      });
      return;
    }

    if (!currentHousehold) {
      toast({
        title: "No Household Selected",
        description: "Please select or create a household to manage meal plans.",
        variant: "destructive",
      });
      return;
    }
    
    setAddMealModal({ open: true, mealType });
  };

  const onAddMealFinish = async (mealType: MealType, recipeId: string, leftoverServings?: number) => {
    if (!user) return;
    
    console.log("Adding meal to plan:", { mealType, recipeId, week, leftoverServings });
    
    const currentPlansForType = getMealPlansForType(mealType);
    
    try {
      const mealPlanData = {
        date: new Date().toISOString().split('T')[0],
        mealType,
        recipeId,
        createdBy: user.id,
        slotIndex: currentPlansForType.length,
        isLeftover: false,
      };

      if (mealType === 'dinner' && leftoverServings) {
        await addMealPlanWithLeftovers(mealPlanData, week, leftoverServings);
      } else {
        await addMealPlan(mealPlanData, week);
      }
      
      setAddMealModal({ open: false, mealType: null });
    } catch (error) {
      console.error("Error adding meal:", error);
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    const currentWeekPlans = getMealPlansForWeek(week);
    if (currentWeekPlans.length === 0) return;
    if (!window.confirm("Clear the entire meal plan?")) return;
    
    await clearWeek(week);
  };

  const handleShareMealPlan = () => {
    const currentWeekPlans = getMealPlansForWeek(week);
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
    if (navigator.share) {
      navigator.share({ title: "Meal Plan", text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
    }
    toast({
      title: "Copied Meal Plan",
      description: "Meal plan copied to clipboard!",
    });
  };

  return {
    mealTypes,
    mealTypeToCategories,
    addMealModal,
    setAddMealModal,
    getMealPlansForType,
    handleRemoveMeal,
    handleAddMeal,
    onAddMealFinish,
    handleClearAll,
    handleShareMealPlan,
  };
};
