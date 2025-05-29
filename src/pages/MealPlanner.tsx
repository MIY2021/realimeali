
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { MealPlannerModals } from "@/components/meal-planner/MealPlannerModals";
import { Recipe, MealPlan, MealPlanMealType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useMealPlanOperations } from "@/hooks/useMealPlanOperations";
import { CustomMealPlanCalendar } from "@/components/meal-planner/CustomMealPlanCalendar";

export default function MealPlanner() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes } = useRecipes();
  const { mealPlans, getMealPlansForWeek, getRecipeForMealPlan } = useMealPlan();
  const { generateRandomMealPlan, isGenerating } = useRandomMealSelection();
  const { toast } = useToast();
  const { addMealPlan, editMealPlan, removeMealPlan } = useMealPlanOperations();

  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  const [addMealModal, setAddMealModal] = useState({ open: false, mealType: null as MealPlanMealType | null, date: null as string | null });
  const [leftoverModal, setLeftoverModal] = useState({ open: false, mealPlan: null as MealPlan | null, recipe: null as Recipe | null });
  const [removeMealDialog, setRemoveMealDialog] = useState({ open: false, mealPlanId: null as string | null, recipe: null as Recipe | null });
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [isCalendarView, setIsCalendarView] = useState(false);

  const handleWeekChange = (week: 1 | 2) => {
    setWeekNumber(week);
  };

  const handleRandomize = async () => {
    if (!recipes || recipes.length === 0) {
      toast({
        title: "No Recipes Found",
        description: "Add some recipes to your collection first!",
      });
      return;
    }

    setShowReplaceDialog(true);
  };

  const confirmReplaceMealPlan = async () => {
    const quantities = {
      dinner: 7,
      lunch: 7,
      breakfast: 7,
      snacks: 7,
    };

    try {
      const newMealPlans = await generateRandomMealPlan(quantities);
      const mealPlansToDelete = getMealPlansForWeek(weekNumber);
      await Promise.all(mealPlansToDelete.map(mealPlan => removeMealPlan(mealPlan.id)));

      if (newMealPlans && currentHousehold) {
        await Promise.all(
          newMealPlans.map(async (meal) => {
            if (currentHousehold) {
              await addMealPlan(
                {
                  recipeId: meal.recipe.id,
                  date: meal.date,
                  mealType: meal.mealType,
                  householdId: currentHousehold.id,
                  slotIndex: 0,
                  isLeftover: false,
                  servings: meal.recipe.servings,
                  weekNumber: weekNumber,
                  createdBy: user?.id || "",
                },
                weekNumber
              );
            }
          })
        );

        toast({
          title: "Meal Plan Generated",
          description: "A new meal plan has been generated for the week.",
        });
      }
    } catch (error) {
      toast({
        title: "Error Generating Meal Plan",
        description: "Failed to generate a new meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowReplaceDialog(false);
    }
  };

  const handleShare = () => {
    toast({
      title: "Share Meal Plan",
      description: "Sharing functionality is not yet implemented.",
    });
  };

  const handleClearAll = () => {
    setClearAllDialog(true);
  };

  const confirmClearAll = async () => {
    const mealPlansToDelete = getMealPlansForWeek(weekNumber);
    await Promise.all(mealPlansToDelete.map(mealPlan => removeMealPlan(mealPlan.id)));

    toast({
      title: "Meal Plan Cleared",
      description: `All meals for Week ${weekNumber} have been removed.`,
    });
  };

  const handleAddMeal = (mealType: MealPlanMealType, date: string) => {
    setAddMealModal({ open: true, mealType, date });
  };

  const handleAddMealFinish = async (recipe: Recipe) => {
    if (addMealModal.mealType && addMealModal.date && currentHousehold) {
      await addMealPlan(
        {
          recipeId: recipe.id,
          date: addMealModal.date,
          mealType: addMealModal.mealType,
          householdId: currentHousehold.id,
          slotIndex: 0,
          isLeftover: false,
          servings: recipe.servings,
          weekNumber: weekNumber,
          createdBy: user?.id || "",
        },
        weekNumber
      );

      setAddMealModal({ open: false, mealType: null, date: null });
      toast({
        title: "Meal Added",
        description: `${recipe.title} has been added to your meal plan.`,
      });
    }
  };

  const handleRemoveMeal = (mealPlanId: string, recipe: Recipe) => {
    setRemoveMealDialog({ open: true, mealPlanId, recipe });
  };

  const confirmRemoveMeal = async () => {
    if (removeMealDialog.mealPlanId) {
      await removeMealPlan(removeMealDialog.mealPlanId);
      setRemoveMealDialog({ open: false, mealPlanId: null, recipe: null });
      toast({
        title: "Meal Removed",
        description: "The meal has been removed from your meal plan.",
      });
    }
  };

  const handleCreateLeftover = (mealPlan: MealPlan, recipe: Recipe) => {
    setLeftoverModal({ open: true, mealPlan, recipe });
  };

  const handleLeftoverConfirm = async (servings: number) => {
    if (leftoverModal.mealPlan && leftoverModal.recipe && currentHousehold) {
      const tomorrow = new Date(leftoverModal.mealPlan.date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];

      await addMealPlan(
        {
          recipeId: leftoverModal.recipe.id,
          date: tomorrowDate,
          mealType: "lunch",
          householdId: currentHousehold.id,
          slotIndex: 0,
          isLeftover: true,
          leftoverServings: servings,
          originalServings: leftoverModal.recipe.servings,
          servings: servings,
          weekNumber: weekNumber,
          createdBy: user?.id || "",
        },
        weekNumber
      );

      setLeftoverModal({ open: false, mealPlan: null, recipe: null });
      toast({
        title: "Leftovers Created",
        description: `Lunch leftovers created for ${tomorrowDate}.`,
      });
    }
  };

  const getMealPlansForDate = (date: string): MealPlan[] => {
    return getMealPlansForWeek(weekNumber).filter((mealPlan) => mealPlan.date === date);
  };

  const getRecipeById = (recipeId: string): Recipe | undefined => {
    return recipes.find((recipe) => recipe.id === recipeId);
  };

  const [clearAllDialog, setClearAllDialog] = useState(false);

  return (
    <div className="container py-6">
      <MealPlannerHeader
        currentWeek={weekNumber}
        onWeekChange={handleWeekChange}
        isCalendarView={isCalendarView}
        setIsCalendarView={setIsCalendarView}
      />

      <MealPlannerActions
        onRandomize={handleRandomize}
        onShare={handleShare}
        onClearAll={handleClearAll}
        isLoading={isGenerating}
        currentWeek={weekNumber}
      />

      <MealPlannerModals
        addMealModal={addMealModal}
        setAddMealModal={setAddMealModal}
        recipes={recipes}
        onAddMealFinish={(mealType: MealPlanMealType, recipeId: string) => {
          const recipe = recipes.find(r => r.id === recipeId);
          if (recipe) handleAddMealFinish(recipe);
        }}
        leftoverModal={leftoverModal}
        setLeftoverModal={setLeftoverModal}
        onLeftoverConfirm={handleLeftoverConfirm}
        showReplaceDialog={showReplaceDialog}
        setShowReplaceDialog={setShowReplaceDialog}
        handleReplaceConfirm={confirmReplaceMealPlan}
        currentWeek={weekNumber}
        showQuantityDialog={false}
        setShowQuantityDialog={() => {}}
        handleQuantitySubmit={() => {}}
        clearMealPlanDialog={clearAllDialog}
        setClearMealPlanDialog={setClearAllDialog}
        confirmClearAll={confirmClearAll}
        deleteMealDialog={removeMealDialog}
        setDeleteMealDialog={setRemoveMealDialog}
        confirmRemoveMeal={confirmRemoveMeal}
      />

      <CustomMealPlanCalendar
        weekNumber={weekNumber}
        onAddMeal={handleAddMeal}
        getMealPlansForDate={getMealPlansForDate}
        getRecipeById={getRecipeById}
        onRemoveMeal={handleRemoveMeal}
        onCreateLeftover={handleCreateLeftover}
        isCalendarView={isCalendarView}
      />
    </div>
  );
}
