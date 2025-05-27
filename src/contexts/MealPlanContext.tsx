import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { MealPlan, Recipe, MealType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { mealPlanService } from "@/services/mealPlanService";

export interface HouseholdMealPlan {
  id: string;
  household_id: string;
  recipe_id: string;
  meal_type: string;
  week_number: number;
  slot_index: number;
  notes?: string;
  date_scheduled: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  parent_meal_plan_id?: string;
  is_leftover: boolean;
  leftover_servings?: number;
  original_servings?: number;
}

interface MealPlanContextType {
  mealPlans: MealPlan[];
  getMealPlansForWeek: (weekNumber: 1 | 2) => MealPlan[];
  getRecipeForMealPlan: (mealPlan: MealPlan) => Recipe | undefined;
  addMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2, silentMode?: boolean) => Promise<void>;
  addMealPlanWithLeftovers: (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2, leftoverServings?: number, silentMode?: boolean) => Promise<void>;
  removeMealPlan: (id: string) => Promise<void>;
  clearWeek: (weekNumber: 1 | 2) => Promise<void>;
  reorderMealPlans: (mealType: MealType, weekNumber: 1 | 2, sourceIndex: number, destinationIndex: number) => Promise<void>;
  isLoading: boolean;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    
    const weekPlans = mealPlans.filter(plan => (plan as any).weekNumber === weekNumber);
    console.log(`Getting meal plans for week ${weekNumber}:`, weekPlans);
    return weekPlans;
  }, [mealPlans, user?.id, currentHousehold?.id]);

  const getRecipeForMealPlan = useCallback((mealPlan: MealPlan): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === mealPlan.recipeId);
  }, [recipes]);

  const addMealPlan = useCallback(async (mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2, silentMode = false) => {
    if (!user || !currentHousehold) {
      if (!silentMode) {
        console.error("User or household not available");
        toast({
          title: "Error", 
          description: "You must be logged in and have a current household to add meal plans.",
          variant: "destructive",
        });
      }
      return;
    }

    const recipeExists = recipes.some(recipe => recipe.id === mealPlanData.recipeId);
    if (!recipeExists) {
      if (!silentMode) {
        console.error("Recipe not found in collection:", mealPlanData.recipeId);
        toast({
          title: "Error",
          description: "Recipe not found in your collection.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      if (!silentMode) {
        console.log("Adding meal plan:", { mealPlanData, weekNumber, userId: user.id, householdId: currentHousehold.id });
      }
      
      const newMealPlan = await mealPlanService.addMealPlan(
        mealPlanData, 
        weekNumber, 
        currentHousehold.id, 
        user.id,
        silentMode
      );

      setMealPlans(prev => [...prev, newMealPlan]);
      
      if (!silentMode) {
        const recipe = recipes.find(r => r.id === mealPlanData.recipeId);
        toast({
          title: "Recipe Added",
          description: `${recipe?.title || 'Recipe'} has been added to your meal plan for Week ${weekNumber}.`,
        });
      }
    } catch (err) {
      console.error("Error adding meal plan:", err);
      if (!silentMode) {
        toast({
          title: "Error",
          description: "Failed to add meal plan. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [user?.id, currentHousehold?.id, recipes]);

  const addMealPlanWithLeftovers = useCallback(async (
    mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, 
    weekNumber: 1 | 2, 
    leftoverServings?: number,
    silentMode = false
  ) => {
    if (!user || !currentHousehold) return;

    const recipe = recipes.find(r => r.id === mealPlanData.recipeId);
    if (!recipe) return;

    try {
      await addMealPlan({
        ...mealPlanData,
        originalServings: recipe.servings,
        isLeftover: false,
        householdId: currentHousehold.id,
      }, weekNumber, silentMode);

      if (leftoverServings && leftoverServings > 0) {
        const currentPlans = getMealPlansForWeek(weekNumber);
        const justAddedPlan = currentPlans[currentPlans.length - 1];
        
        if (justAddedPlan) {
          await addMealPlan({
            date: mealPlanData.date,
            mealType: 'lunch',
            recipeId: mealPlanData.recipeId,
            createdBy: user.id,
            slotIndex: 0,
            parentMealPlanId: justAddedPlan.id,
            isLeftover: true,
            leftoverServings: leftoverServings,
            originalServings: recipe.servings,
            householdId: currentHousehold.id,
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

  const removeMealPlan = useCallback(async (id: string) => {
    if (!user || !currentHousehold) return;

    try {
      const childLeftovers = mealPlans.filter(plan => plan.parentMealPlanId === id);
      
      if (childLeftovers.length > 0) {
        const shouldRemoveLeftovers = window.confirm(
          "This meal has leftover portions planned. Remove leftovers too?"
        );
        
        if (shouldRemoveLeftovers) {
          for (const leftover of childLeftovers) {
            await mealPlanService.removeMealPlan(leftover.id, currentHousehold.id);
          }
        }
      }
      
      await mealPlanService.removeMealPlan(id, currentHousehold.id);

      setMealPlans(prev => prev.filter(plan => 
        plan.id !== id && plan.parentMealPlanId !== id
      ));
      
      toast({
        title: "Recipe Removed",
        description: "Recipe has been removed from your meal plan.",
      });
    } catch (err) {
      console.error("Error removing meal plan:", err);
      toast({
        title: "Error",
        description: "Failed to remove meal plan. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.id, currentHousehold?.id, mealPlans]);

  const clearWeek = useCallback(async (weekNumber: 1 | 2) => {
    if (!user || !currentHousehold) return;

    try {
      await mealPlanService.clearWeek(weekNumber, currentHousehold.id);
      setMealPlans(prev => prev.filter(plan => (plan as any).weekNumber !== weekNumber));
      
      toast({
        title: "Week Cleared",
        description: `Week ${weekNumber} meal plan has been cleared.`,
      });
    } catch (err) {
      console.error("Error clearing week:", err);
      toast({
        title: "Error",
        description: "Failed to clear week. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.id, currentHousehold?.id]);

  const reorderMealPlans = useCallback(async (
    mealType: MealType, 
    weekNumber: 1 | 2, 
    sourceIndex: number, 
    destinationIndex: number
  ) => {
    if (!user || !currentHousehold) return;

    const mealPlansForType = mealPlans.filter(
      plan => plan.mealType === mealType && (plan as any).weekNumber === weekNumber
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
          plan => !(plan.mealType === mealType && (plan as any).weekNumber === weekNumber)
        );
        const updatedReorderedPlans = reorderedPlans.map((plan, index) => ({
          ...plan,
          slotIndex: index
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
      isLoading
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
