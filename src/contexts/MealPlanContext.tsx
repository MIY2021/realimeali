import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
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

  // Use refs to track state without causing re-renders
  const lastFetchedHouseholdIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Create stable user and household references
  const stableUserId = user?.id || null;
  const stableHouseholdId = currentHousehold?.id || null;

  const { addMealPlan, removeMealPlan, clearWeek } = useMealPlanOperations(
    user, 
    currentHousehold, 
    recipes, 
    setMealPlans, 
    mealPlans
  );

  // Stable fetchMealPlans function with no dependencies on loading states
  const fetchMealPlans = useCallback(async () => {
    const userId = stableUserId;
    const householdId = stableHouseholdId;
    
    if (!userId || !householdId) {
      // Only clear if we had data before
      if (lastFetchedHouseholdIdRef.current) {
        console.log('DEBUG: No user or household, clearing meal plans');
        setMealPlans([]);
        lastFetchedHouseholdIdRef.current = null;
        currentUserIdRef.current = null;
      }
      return;
    }

    // Prevent duplicate fetches
    if (currentUserIdRef.current === userId && 
        lastFetchedHouseholdIdRef.current === householdId &&
        isFetchingRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      isFetchingRef.current = true;
      console.log('DEBUG: Fetching meal plans for household:', householdId);
      
      currentUserIdRef.current = userId;
      lastFetchedHouseholdIdRef.current = householdId;
      
      const plans = await mealPlanService.fetchMealPlans(householdId);
      console.log('DEBUG: Transformed plans:', plans);
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
      isFetchingRef.current = false;
    }
  }, [stableUserId, stableHouseholdId, toast]);

  // Single effect to handle data fetching - only depend on stable IDs
  useEffect(() => {
    // Only fetch if the user/household combination actually changed
    if (currentUserIdRef.current !== stableUserId || 
        lastFetchedHouseholdIdRef.current !== stableHouseholdId) {
      fetchMealPlans();
    }
  }, [stableUserId, stableHouseholdId, fetchMealPlans]);

  const updateMealPlanServings = useCallback(async (
    mealPlanId: string, 
    newServings: number
  ): Promise<void> => {
    if (!user || !currentHousehold) {
      throw new Error('User and household required');
    }

    try {
      await mealPlanService.updateMealPlanServings(mealPlanId, newServings, currentHousehold.id);
      
      // Update local state - update original_servings since that's what we're using
      setMealPlans(prev => prev.map(plan => 
        plan.id === mealPlanId 
          ? { ...plan, original_servings: newServings }
          : plan
      ));
    } catch (error) {
      console.error("Error updating meal plan servings:", error);
      throw error;
    }
  }, [user, currentHousehold, setMealPlans, toast]);

  const getMealPlansForWeek = useCallback((weekNumber: 1 | 2): MealPlan[] => {
    if (!stableUserId || !stableHouseholdId) return [];
    
    const weekPlans = mealPlans.filter(plan => plan.week_number === weekNumber);
    console.log(`DEBUG: Getting meal plans for week ${weekNumber}:`, weekPlans);
    return weekPlans;
  }, [mealPlans, stableUserId, stableHouseholdId]);

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
  }, [user?.id, currentHousehold?.id, recipes, addMealPlan, getMealPlansForWeek, toast]);

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
  }, [user?.id, currentHousehold?.id, mealPlans, setMealPlans]);

  // Memoize context value with only stable dependencies
  const contextValue: MealPlanContextType = {
    mealPlans,
    getMealPlansForWeek,
    getRecipeForMealPlan,
    addMealPlan,
    addMealPlanWithLeftovers,
    removeMealPlan,
    clearWeek,
    reorderMealPlans,
    updateMealPlanServings,
    isLoading,
    fetchMealPlans
  };

  return (
    <MealPlanContext.Provider value={contextValue}>
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
