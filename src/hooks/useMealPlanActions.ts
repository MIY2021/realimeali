import { useState } from "react";
import { MealType, MealPlan, Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { createMealTypeToCategories } from "@/utils/mealCategoryUtils";

export const useMealPlanActions = (week: 1 | 2) => {
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

  const [addMealModal, setAddMealModal] = useState<{
    open: boolean;
    mealType: MealType | null;
  }>({ open: false, mealType: null });

  const [leftoverModal, setLeftoverModal] = useState<{
    open: boolean;
    mealPlan: MealPlan | null;
    recipe: Recipe | null;
  }>({ open: false, mealPlan: null, recipe: null });

  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];
  
  // Use dynamic category mappings
  const mealTypeToCategories = createMealTypeToCategories();

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

  const handleCreateLeftover = (mealPlan: MealPlan, recipe: Recipe) => {
    if (!user || !currentHousehold) {
      toast({
        title: "Login Required",
        description: "You need to log in to create leftovers.",
        variant: "destructive",
      });
      return;
    }

    setLeftoverModal({ open: true, mealPlan, recipe });
  };

  const onLeftoverConfirm = async (servings: number) => {
    if (!user || !currentHousehold || !leftoverModal.mealPlan || !leftoverModal.recipe) return;
    
    const { mealPlan, recipe } = leftoverModal;
    
    try {
      const currentLunchPlans = getMealPlansForType('lunch');
      
      // Create leftover lunch meal plan
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

      setLeftoverModal({ open: false, mealPlan: null, recipe: null });
    } catch (error) {
      console.error("Error creating leftover:", error);
      toast({
        title: "Error",
        description: "Failed to create leftover. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onAddMealFinish = async (mealType: MealType, recipeId: string, leftoverServings?: number) => {
    if (!user || !currentHousehold) return;
    
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
        householdId: currentHousehold.id,
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

  const handleReorderMeals = async (mealType: MealType, sourceIndex: number, destinationIndex: number) => {
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

  return {
    mealTypes,
    mealTypeToCategories,
    addMealModal,
    setAddMealModal,
    leftoverModal,
    setLeftoverModal,
    getMealPlansForType,
    handleRemoveMeal,
    handleAddMeal,
    handleCreateLeftover,
    handleReorderMeals,
    onLeftoverConfirm,
    onAddMealFinish,
    handleClearAll,
    handleShareMealPlan,
  };
};
