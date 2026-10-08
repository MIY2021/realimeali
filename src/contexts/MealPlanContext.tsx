import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { MealPlan, Recipe, MealType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { mealPlanService } from "@/services/mealPlanService";
import { MealPlanContextType } from "./MealPlanContext/types";
import { useMealPlanOperations } from "./MealPlanContext/useMealPlanOperations";
import { supabase } from "@/integrations/supabase/client";

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

  const { addMealPlan, removeMealPlan, clearWeek, copyWeek } = useMealPlanOperations(
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
      console.time('[Performance] Meal plans fetch');
      console.log('DEBUG: Fetching meal plans for household:', householdId);
      
      currentUserIdRef.current = userId;
      const plans = await mealPlanService.fetchMealPlans(householdId);
      console.log('DEBUG: Transformed plans:', plans);
      setMealPlans(plans);
      lastFetchedHouseholdIdRef.current = householdId;
      console.timeEnd('[Performance] Meal plans fetch');
    } catch (err) {
      console.error("Error fetching meal plans:", err);
      toast({
        title: "Error",
        description: "Failed to fetch meal plans. Please try again.",
        variant: "destructive",
      });
      console.timeEnd('[Performance] Meal plans fetch');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [stableUserId, stableHouseholdId, toast]);

  // Keep household meal-plan state in sync when another household member
  // adds, removes, or changes a meal plan. The subscription only triggers a
  // lightweight refresh; the existing fetch remains the single source of truth.
  useEffect(() => {
    if (!stableUserId || !stableHouseholdId) return;

    const channel = supabase
      .channel(`meal-plan-realtime-${stableHouseholdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_meal_plans',
          filter: `household_id=eq.${stableHouseholdId}`,
        },
        () => {
          void fetchMealPlans();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [stableUserId, stableHouseholdId, fetchMealPlans]);

  // This context owns its initial fetch. The page does not start a second
  // request, so there is one authoritative loading lifecycle.
  useEffect(() => {
    if (stableUserId && stableHouseholdId && lastFetchedHouseholdIdRef.current !== stableHouseholdId) {
      void fetchMealPlans();
      return;
    }

    if (!stableUserId || !stableHouseholdId) {
      if (lastFetchedHouseholdIdRef.current) {
        console.log('MealPlanContext: No user or household, clearing meal plans');
        setMealPlans([]);
        lastFetchedHouseholdIdRef.current = null;
        currentUserIdRef.current = null;
      }
    }
  }, [stableUserId, stableHouseholdId, fetchMealPlans]);

  const getMealPlansForWeek = useCallback((weekKey: string): MealPlan[] => {
    if (!stableUserId || !stableHouseholdId) return [];
    
    const weekPlans = mealPlans.filter(plan => plan.week_key === weekKey);
    console.log(`DEBUG: Getting meal plans for week ${weekKey}:`, weekPlans);
    return weekPlans;
  }, [mealPlans, stableUserId, stableHouseholdId]);

  const getRecipeForMealPlan = useCallback((mealPlan: MealPlan): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === mealPlan.recipe_id);
  }, [recipes]);

  const replaceFreetypedMealPlan = useCallback(async (mealPlanId: string, recipeId: string, plannedServings: number) => {
    if (!user || !currentHousehold) throw new Error('User must be logged in and have a household');
    await mealPlanService.replaceFreetypedMealPlan(mealPlanId, recipeId, plannedServings, currentHousehold.id);
    setMealPlans(prev => prev.map(plan =>
      plan.id === mealPlanId
        ? { ...plan, recipe_id: recipeId, is_freetyped: false, meal_name: undefined, original_servings: plannedServings, planned_servings: plannedServings }
        : plan
    ));
  }, [user?.id, currentHousehold?.id]);

  const updateMealPlanServings = useCallback(async (mealPlanId: string, plannedServings: number) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      await mealPlanService.updateMealPlanServings(mealPlanId, plannedServings, currentHousehold.id);
      
      // Update local state
      setMealPlans(prev => prev.map(plan => 
        plan.id === mealPlanId 
          ? { ...plan, planned_servings: plannedServings }
          : plan
      ));
    } catch (error) {
      console.error('Error updating meal plan servings:', error);
      throw error;
    }
  }, [user?.id, currentHousehold?.id]);

  const updateMealPlanCompletion = useCallback(async (mealPlanId: string, isCompleted: boolean) => {
    if (!user || !currentHousehold) {
      throw new Error('User must be logged in and have a household');
    }

    try {
      await mealPlanService.updateMealPlanCompletion(mealPlanId, isCompleted, currentHousehold.id);
      
      // Update local state
      setMealPlans(prev => prev.map(plan => 
        plan.id === mealPlanId 
          ? { ...plan, is_completed: isCompleted }
          : plan
      ));

      // Check achievements when marking as complete
      if (isCompleted) {
        const completedMeal = mealPlans.find(m => m.id === mealPlanId);
        if (completedMeal) {
          // Check Perfect Planner achievement
          window.dispatchEvent(new CustomEvent('checkPerfectPlanner', {
            detail: { weekKey: completedMeal.week_key }
          }));
          
          // Check cooking achievements if meal has a recipe
          if (completedMeal.recipe_id) {
            window.dispatchEvent(new CustomEvent('checkCookingAchievements', { 
              detail: { recipeId: completedMeal.recipe_id }
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error updating meal plan completion:', error);
      throw error;
    }
  }, [user?.id, currentHousehold?.id, mealPlans]);

  const addMealPlanWithLeftovers = useCallback(async (
    mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>, 
    weekKey: string, 
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
        planned_servings: mealPlanData.planned_servings || recipe.servings, // Ensure planned_servings is set
        is_leftover: false,
        household_id: currentHousehold.id,
        week_key: weekKey,
        is_completed: false, // Add the required is_completed field
        is_freetyped: false, // Not a freetyped meal
      }, weekKey, silentMode);

      if (leftoverServings && leftoverServings > 0) {
        const currentPlans = getMealPlansForWeek(weekKey);
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
            planned_servings: leftoverServings, // Add planned_servings for leftover
            household_id: currentHousehold.id,
            week_key: weekKey,
            is_completed: false, // Add the required is_completed field
            is_freetyped: false, // Not a freetyped meal
          }, weekKey, silentMode);

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
    weekKey: string, 
    reorderedIds: string[]
  ) => {
    if (!user || !currentHousehold) return;

    // Get all meal plans for this type and week
    const mealPlansForType = mealPlans.filter(
      plan => plan.meal_type === mealType && plan.week_key === weekKey
    );

    // Create a map for quick lookup
    const planMap = new Map(mealPlansForType.map(plan => [plan.id, plan]));

    // Build the reordered array based on the provided IDs
    const reorderedPlans: MealPlan[] = [];
    for (const id of reorderedIds) {
      const plan = planMap.get(id);
      if (plan) {
        reorderedPlans.push(plan);
      }
    }

    // Validate we have the same number of plans
    if (reorderedPlans.length !== mealPlansForType.length) {
      console.warn("Reorder mismatch: expected", mealPlansForType.length, "got", reorderedPlans.length);
      return;
    }

    // Optimistic update - update UI immediately
    const updatedReorderedPlans = reorderedPlans.map((plan, index) => ({
      ...plan,
      slot_index: index
    }));

    setMealPlans(prev => {
      const filteredPlans = prev.filter(
        plan => !(plan.meal_type === mealType && plan.week_key === weekKey)
      );
      return [...filteredPlans, ...updatedReorderedPlans];
    });

    try {
      await mealPlanService.reorderMealPlans(mealType, weekKey, currentHousehold.id, reorderedPlans);
    } catch (err) {
      console.error("Error reordering meal plans:", err);
      // Revert on error
      setMealPlans(prev => {
        const filteredPlans = prev.filter(
          plan => !(plan.meal_type === mealType && plan.week_key === weekKey)
        );
        return [...filteredPlans, ...mealPlansForType];
      });
      throw err;
    }
  }, [user?.id, currentHousehold?.id, mealPlans]);

  // Memoize context value with only stable dependencies
  const contextValue: MealPlanContextType = {
    mealPlans,
    getMealPlansForWeek,
    getRecipeForMealPlan,
    addMealPlan,
    addMealPlanWithLeftovers,
    removeMealPlan,
    clearWeek,
    copyWeek,
    reorderMealPlans,
    updateMealPlanServings,
    replaceFreetypedMealPlan,
    updateMealPlanCompletion, // Add completion function
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
