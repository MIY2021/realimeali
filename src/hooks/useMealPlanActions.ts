
import { useState } from "react";
import { MealType, MealPlan, Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { createMealTypeToCategories } from "@/utils/mealCategoryUtils";
import { useMealPlanModals } from "./useMealPlanModals";
import { useMealPlanOperations } from "./useMealPlanOperations";

export const useMealPlanActions = (week: 1 | 2) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();

  const [mealTypes, setMealTypes] = useState<MealType[]>(["dinner", "lunch", "breakfast", "snacks"]);
  const mealTypeToCategories = createMealTypeToCategories();

  const modals = useMealPlanModals();
  const operations = useMealPlanOperations(week);

  const handleRemoveMeal = async (planId: string) => {
    const mealPlan = operations.getMealPlansForType(
      modals.deleteMealDialog.recipe?.categories?.[0] as MealType || 'dinner'
    ).find(plan => plan.id === planId);
    const recipe = mealPlan ? recipes.find(r => r.id === mealPlan.recipeId) : null;
    
    modals.setDeleteMealDialog({ open: true, planId, recipe });
  };

  const confirmRemoveMeal = async () => {
    if (!modals.deleteMealDialog.planId) return;
    await operations.performRemoveMeal(modals.deleteMealDialog.planId);
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
    
    modals.setAddMealModal({ open: true, mealType });
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

    modals.setLeftoverModal({ open: true, mealPlan, recipe });
  };

  const onLeftoverConfirm = async (servings: number) => {
    if (!user || !currentHousehold || !modals.leftoverModal.mealPlan || !modals.leftoverModal.recipe) return;
    
    const { mealPlan, recipe } = modals.leftoverModal;
    await operations.performCreateLeftover(mealPlan, recipe, servings);
    modals.setLeftoverModal({ open: false, mealPlan: null, recipe: null });
  };

  const onAddMealFinish = async (mealType: MealType, recipeId: string, leftoverServings?: number) => {
    await operations.performAddMeal(mealType, recipeId, leftoverServings);
    modals.setAddMealModal({ open: false, mealType: null });
  };

  const handleClearAll = async () => {
    const currentWeekPlans = operations.getMealPlansForType('dinner')
      .concat(operations.getMealPlansForType('lunch'))
      .concat(operations.getMealPlansForType('breakfast'))
      .concat(operations.getMealPlansForType('snacks'));
    
    if (currentWeekPlans.length === 0) return;
    modals.setClearMealPlanDialog(true);
  };

  const confirmClearAll = async () => {
    await operations.performClearAll();
  };

  const handleShareMealPlan = () => {
    const shareText = operations.generateShareText();
    
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
    await operations.performReorderMeals(mealType, sourceIndex, destinationIndex);
  };

  return {
    mealTypes,
    setMealTypes,
    mealTypeToCategories,
    getMealPlansForType: operations.getMealPlansForType,
    handleRemoveMeal,
    confirmRemoveMeal,
    handleAddMeal,
    handleCreateLeftover,
    handleReorderMeals,
    onLeftoverConfirm,
    onAddMealFinish,
    handleClearAll,
    confirmClearAll,
    handleShareMealPlan,
    ...modals,
  };
};
