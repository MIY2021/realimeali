import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { MealPlan, Recipe, MealType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { mealPlanService } from "@/services/mealPlanService";
import { MealPlanContextType } from "./MealPlanContext/types";
import { useMealPlanOperations } from "./MealPlanContext/useMealPlanOperations";

export type { HouseholdMealPlan } from "./MealPlanContext/types";

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { addMealPlan, removeMealPlan, clearWeek } = useMealPlanOperations(
    user, 
    currentHousehold, 
    recipes, 
    setMealPlans, 
    mealPlans
  );

  const fetchMealPlans = useCallback(async () => {
    if (!user || !currentHousehold) {
      console.log("No user or household, clearing meal plans");
      setMealPlans([]);
      return;
    }

    try {
      setIsLoading(true);
      const plans = await mealPlanService.fetchMealPlans(currentHousehold.id);
      console.log("Transformed plans:", plans);
      console.log("Plans with week numbers:", plans.map(p => ({ id: p.id, meal_type: p.meal_type, week_number: p.week_number })));
      setMealPlans(plans);
    } catch (err) {
      console.error("Error fetching meal plans:", err);
      toast({
        title: "Error",
        description: "Failed to fetch meal plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentHousehold?.id]);

  useEffect(() => {
    fetchMealPlans();
  }, [fetchMealPlans]);

  const getMealPlansForWeek = useCallback((weekNumber: 1 | 2): MealPlan[] => {
    if (!user || !currentHousehold) return [];
    
    const weekPlans = mealPlans.filter(plan => plan.week_number === weekNumber);
    console.log(`Getting meal plans for week ${weekNumber}:`, weekPlans);
    return weekPlans;
  }, [mealPlans, user?.id, currentHousehold?.id]);

  const getRecipeForMealPlan = useCallback((mealPlan: MealPlan): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === mealPlan.recipe_id);
  }, [recipes]);

  const addMealPlanWithLeftovers = useCallback(async (
    mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>, 
    weekNumber: 1 | 2, 
    leftoverServings?: number,
    silentMode = false
  ) => {
    if (!user || !currentHousehold) return;

    const recipe = recipes.find(r => r.id === mealPlanData.recipe_id);
    if (!recipe) return;

    try {
      await addMealPlan({
        ...mealPlanData,
        original_servings: recipe.servings,
        is_leftover: false,
        household_id: currentHousehold.id,
        week_number: weekNumber,
      }, weekNumber, silentMode);

      if (leftoverServings && leftoverServings > 0) {
        const currentPlans = getMealPlansForWeek(weekNumber);
        const justAddedPlan = currentPlans[currentPlans.length - 1];
        
        if (justAddedPlan) {
          await addMealPlan({
            date: mealPlanData.date,
            meal_type: 'lunch',
            recipe_id: mealPlanData.recipe_id,
            created_by: user.id,
            slot_index: 0,
            parent_meal_plan_id: justAddedPlan.id,
            is_leftover: true,
            leftover_servings: leftoverServings,
            original_servings: recipe.servings,
            household_id: currentHousehold.id,
            week_number: weekNumber,
          }, weekNumber, silentMode);

          if (!silentMode) {
            toast({
              title: "Leftover Lunch Added",
              description: `${leftoverServings} servings of ${recipe.title} scheduled for lunch leftovers.`,
            });
          }
        }
      }
    } catch (err) {
      console.error("Error adding meal plan with leftovers:", err);
    }
  }, [user?.id, currentHousehold?.id, recipes, addMealPlan, getMealPlansForWeek]);

  const reorderMealPlans = useCallback(async (
    mealType: MealType, 
    weekNumber: 1 | 2, 
    sourceIndex: number, 
    destinationIndex: number
  ) => {
    if (!user || !currentHousehold) return;

    const mealPlansForType = mealPlans.filter(
      plan => plan.meal_type === mealType && plan.week_number === weekNumber
    );

    if (sourceIndex < 0 || destinationIndex < 0 || 
        sourceIndex >= mealPlansForType.length || 
        destinationIndex >= mealPlansForType.length) {
      return;
    }

    const reorderedPlans = [...mealPlansForType];
    const [movedPlan] = reorderedPlans.splice(sourceIndex, 1);
    reorderedPlans.splice(destinationIndex, 0, movedPlan);

    try {
      await mealPlanService.reorderMealPlans(mealType, weekNumber, currentHousehold.id, reorderedPlans);

      setMealPlans(prev => {
        const updated = [...prev];
        const filteredPlans = updated.filter(
          plan => !(plan.meal_type === mealType && plan.week_number === weekNumber)
        );
        const updatedReorderedPlans = reorderedPlans.map((plan, index) => ({
          ...plan,
          slot_index: index
        }));
        
        return [...filteredPlans, ...updatedReorderedPlans];
      });

    } catch (err) {
      console.error("Error reordering meal plans:", err);
      throw err;
    }
  }, [user?.id, currentHousehold?.id, mealPlans]);

  return (
    <MealPlanContext.Provider value={{
      mealPlans,
      getMealPlansForWeek,
      getRecipeForMealPlan,
      addMealPlan,
      addMealPlanWithLeftovers,
      removeMealPlan,
      clearWeek,
      reorderMealPlans,
      isLoading,
      fetchMealPlans // Export the refresh function
    }}>
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error("useMealPlan must be used within a MealPlanProvider");
  }
  return context;
};
