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
  const { mealPlans, fetchMealPlans, createMealPlan, updateMealPlan, deleteMealPlan } = useMealPlan();
  const { generateRandomMealPlan, isGenerating } = useRandomMealSelection();
  const { toast } = useToast();
  const { addMealPlan, editMealPlan, removeMealPlan } = useMealPlanOperations();

  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  const [addMealModal, setAddMealModal] = useState({ open: false, mealType: null as MealPlanMealType | null, date: null as string | null });
  const [leftoverModal, setLeftoverModal] = useState({ open: false, mealPlan: null as MealPlan | null, recipe: null as Recipe | null });
  const [removeMealDialog, setRemoveMealDialog] = useState({ open: false, mealPlanId: null as string | null, recipe: null as Recipe | null });
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [isCalendarView, setIsCalendarView] = useState(false);

  useEffect(() => {
    if (user && currentHousehold) {
      fetchMealPlans(currentHousehold.id);
    }
  }, [user, currentHousehold, fetchMealPlans]);

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
    // Define the desired quantities for each meal type
    const quantities = {
      dinner: 7,
      lunch: 7,
      breakfast: 7,
      snacks: 7,
    };

    try {
      // Generate the random meal plan
      const newMealPlans = await generateRandomMealPlan(quantities);

      // Delete existing meal plans for the current week
      const mealPlansToDelete = mealPlans.filter(mealPlan => mealPlan.weekNumber === weekNumber);
      await Promise.all(mealPlansToDelete.map(mealPlan => removeMealPlan(mealPlan.id)));

      // Add the new meal plans
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
                  prepTime: meal.recipe.prepTime,
                  cookTime: meal.recipe.cookTime,
                  servings: meal.recipe.servings,
                  weekNumber: weekNumber,
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
    // Implement share functionality here
    toast({
      title: "Share Meal Plan",
      description: "Sharing functionality is not yet implemented.",
    });
  };

  const handleClearAll = () => {
    setClearAllDialog(true);
  };

  const confirmClearAll = async () => {
    // Delete all meal plans for the current week
    const mealPlansToDelete = mealPlans.filter(mealPlan => mealPlan.weekNumber === weekNumber);
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
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          weekNumber: weekNumber,
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
          prepTime: 5,
          cookTime: 0,
          servings: servings,
          weekNumber: weekNumber,
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
    return mealPlans.filter((mealPlan) => mealPlan.date === date);
  };

  const getRecipeById = (recipeId: string): Recipe | undefined => {
    return recipes.find((recipe) => recipe.id === recipeId);
  };

  const [clearAllDialog, setClearAllDialog] = useState(false);

  return (
    <div className="container py-6">
      <MealPlannerHeader
        weekNumber={weekNumber}
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
        onAddMealFinish={handleAddMealFinish}
        leftoverModal={leftoverModal}
        setLeftoverModal={setLeftoverModal}
        onLeftoverConfirm={handleLeftoverConfirm}
        showReplaceDialog={showReplaceDialog}
        setShowReplaceDialog={setShowReplaceDialog}
        confirmReplaceMealPlan={confirmReplaceMealPlan}
        clearAllDialog={clearAllDialog}
        setClearAllDialog={setClearAllDialog}
        confirmClearAll={confirmClearAll}
        removeMealDialog={removeMealDialog}
        setRemoveMealDialog={setRemoveMealDialog}
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
