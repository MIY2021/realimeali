import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { MealPlan, Recipe, MealType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  addMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2) => Promise<void>;
  addMealPlanWithLeftovers: (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2, leftoverServings?: number) => Promise<void>;
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

  // Fetch household meal plans from database
  const fetchMealPlans = useCallback(async () => {
    if (!user || !currentHousehold) {
      console.log("No user or household, clearing meal plans");
      setMealPlans([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching meal plans for household:", currentHousehold.id);
      
      const { data, error } = await supabase
        .from('household_meal_plans')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching meal plans:", error);
        throw error;
      }

      console.log("Fetched meal plans data:", data);

      // Transform database format to MealPlan type
      const transformedPlans: MealPlan[] = (data || []).map(dbPlan => ({
        id: dbPlan.id,
        date: dbPlan.date_scheduled,
        mealType: dbPlan.meal_type as any,
        recipeId: dbPlan.recipe_id,
        notes: dbPlan.notes,
        createdBy: dbPlan.created_by,
        createdAt: dbPlan.created_at,
        updatedAt: dbPlan.updated_at,
        slotIndex: dbPlan.slot_index,
        weekNumber: dbPlan.week_number,
        parentMealPlanId: dbPlan.parent_meal_plan_id,
        isLeftover: dbPlan.is_leftover,
        leftoverServings: dbPlan.leftover_servings,
        originalServings: dbPlan.original_servings,
        householdId: dbPlan.household_id,
      }));

      console.log("Transformed plans:", transformedPlans);
      setMealPlans(transformedPlans);
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

  const addMealPlan = useCallback(async (mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2) => {
    if (!user || !currentHousehold) {
      console.error("User or household not available");
      toast({
        title: "Error", 
        description: "You must be logged in and have a current household to add meal plans.",
        variant: "destructive",
      });
      return;
    }

    const recipeExists = recipes.some(recipe => recipe.id === mealPlanData.recipeId);
    if (!recipeExists) {
      console.error("Recipe not found in collection:", mealPlanData.recipeId);
      toast({
        title: "Error",
        description: "Recipe not found in your collection.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Adding meal plan:", { mealPlanData, weekNumber, userId: user.id, householdId: currentHousehold.id });
      
      const insertData = {
        household_id: currentHousehold.id,
        recipe_id: mealPlanData.recipeId,
        meal_type: mealPlanData.mealType,
        week_number: weekNumber,
        slot_index: mealPlanData.slotIndex || 0,
        notes: mealPlanData.notes || null,
        date_scheduled: mealPlanData.date,
        created_by: user.id,
        parent_meal_plan_id: mealPlanData.parentMealPlanId || null,
        is_leftover: mealPlanData.isLeftover || false,
        leftover_servings: mealPlanData.leftoverServings || null,
        original_servings: mealPlanData.originalServings || null,
      };

      console.log("Insert data:", insertData);

      const { data, error } = await supabase
        .from('household_meal_plans')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Meal plan added successfully:", data);

      const newMealPlan: MealPlan = {
        id: data.id,
        date: data.date_scheduled,
        mealType: data.meal_type as any,
        recipeId: data.recipe_id,
        notes: data.notes,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        slotIndex: data.slot_index,
        weekNumber: data.week_number,
        parentMealPlanId: data.parent_meal_plan_id,
        isLeftover: data.is_leftover,
        leftoverServings: data.leftover_servings,
        originalServings: data.original_servings,
        householdId: data.household_id,
      } as any;

      setMealPlans(prev => [...prev, newMealPlan]);
      
      const recipe = recipes.find(r => r.id === mealPlanData.recipeId);
      toast({
        title: "Recipe Added",
        description: `${recipe?.title || 'Recipe'} has been added to your meal plan for Week ${weekNumber}.`,
      });
    } catch (err) {
      console.error("Error adding meal plan:", err);
      toast({
        title: "Error",
        description: "Failed to add meal plan. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.id, currentHousehold?.id, recipes]);

  const addMealPlanWithLeftovers = useCallback(async (
    mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, 
    weekNumber: 1 | 2, 
    leftoverServings?: number
  ) => {
    if (!user || !currentHousehold) return;

    const recipe = recipes.find(r => r.id === mealPlanData.recipeId);
    if (!recipe) return;

    try {
      // Add the main dinner meal plan
      await addMealPlan({
        ...mealPlanData,
        originalServings: recipe.servings,
        isLeftover: false,
        householdId: currentHousehold.id,
      }, weekNumber);

      // If leftover servings specified, add leftover lunch for next day
      if (leftoverServings && leftoverServings > 0) {
        const currentPlans = getMealPlansForWeek(weekNumber);
        const justAddedPlan = currentPlans[currentPlans.length - 1];
        
        if (justAddedPlan) {
          // Add leftover lunch meal plan
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
          }, weekNumber);

          toast({
            title: "Leftover Lunch Added",
            description: `${leftoverServings} servings of ${recipe.title} scheduled for lunch leftovers.`,
          });
        }
      }
    } catch (err) {
      console.error("Error adding meal plan with leftovers:", err);
    }
  }, [user?.id, currentHousehold?.id, recipes, addMealPlan, getMealPlansForWeek]);

  const removeMealPlan = useCallback(async (id: string) => {
    if (!user || !currentHousehold) return;

    try {
      console.log("Removing meal plan:", id);
      
      // Check if this meal plan has leftover children
      const childLeftovers = mealPlans.filter(plan => plan.parentMealPlanId === id);
      
      if (childLeftovers.length > 0) {
        const shouldRemoveLeftovers = window.confirm(
          "This meal has leftover portions planned. Remove leftovers too?"
        );
        
        if (shouldRemoveLeftovers) {
          // Remove child leftovers first
          for (const leftover of childLeftovers) {
            await supabase
              .from('household_meal_plans')
              .delete()
              .eq('id', leftover.id)
              .eq('household_id', currentHousehold.id);
          }
        }
      }
      
      const { error } = await supabase
        .from('household_meal_plans')
        .delete()
        .eq('id', id)
        .eq('household_id', currentHousehold.id);

      if (error) {
        throw error;
      }

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
      console.log("Clearing week:", weekNumber);
      
      const { error } = await supabase
        .from('household_meal_plans')
        .delete()
        .eq('household_id', currentHousehold.id)
        .eq('week_number', weekNumber);

      if (error) {
        throw error;
      }

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

    // Create reordered array
    const reorderedPlans = [...mealPlansForType];
    const [movedPlan] = reorderedPlans.splice(sourceIndex, 1);
    reorderedPlans.splice(destinationIndex, 0, movedPlan);

    try {
      // Update slot indices in database
      const updatePromises = reorderedPlans.map((plan, index) => 
        supabase
          .from('household_meal_plans')
          .update({ slot_index: index })
          .eq('id', plan.id)
          .eq('household_id', currentHousehold.id)
          .eq('week_number', weekNumber)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error("Failed to update meal plan order");
      }

      // Update local state
      setMealPlans(prev => {
        const updated = [...prev];
        
        // Remove old plans
        const filteredPlans = updated.filter(
          plan => !(plan.mealType === mealType && (plan as any).weekNumber === weekNumber)
        );
        
        // Add reordered plans with updated slot indices
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
