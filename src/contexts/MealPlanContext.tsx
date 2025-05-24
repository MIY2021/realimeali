
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MealPlan, Recipe } from "@/types";
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
}

interface MealPlanContextType {
  mealPlans: MealPlan[];
  getMealPlansForWeek: (weekNumber: 1 | 2) => MealPlan[];
  getRecipeForMealPlan: (mealPlan: MealPlan) => Recipe | undefined;
  addMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2) => Promise<void>;
  removeMealPlan: (id: string) => Promise<void>;
  clearWeek: (weekNumber: 1 | 2) => Promise<void>;
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
  const fetchMealPlans = async () => {
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
        weekNumber: dbPlan.week_number, // Store the actual week number from DB
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
  };

  useEffect(() => {
    fetchMealPlans();
  }, [user, currentHousehold]);

  const getMealPlansForWeek = (weekNumber: 1 | 2): MealPlan[] => {
    if (!user || !currentHousehold) return [];
    
    // Simply filter by the stored week_number from the database
    const weekPlans = mealPlans.filter(plan => (plan as any).weekNumber === weekNumber);
    console.log(`Getting meal plans for week ${weekNumber}:`, weekPlans);
    return weekPlans;
  };

  const getRecipeForMealPlan = (mealPlan: MealPlan): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === mealPlan.recipeId);
  };

  const addMealPlan = async (mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2) => {
    if (!user || !currentHousehold) {
      console.error("User or household not available");
      toast({
        title: "Error", 
        description: "You must be logged in and have a current household to add meal plans.",
        variant: "destructive",
      });
      return;
    }

    // Verify the recipe exists in recipes collection
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
        created_by: user.id
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

      // Add to local state with week number
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
        weekNumber: data.week_number, // Include week number in local state
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
  };

  const removeMealPlan = async (id: string) => {
    if (!user || !currentHousehold) return;

    try {
      console.log("Removing meal plan:", id);
      
      const { error } = await supabase
        .from('household_meal_plans')
        .delete()
        .eq('id', id)
        .eq('household_id', currentHousehold.id);

      if (error) {
        throw error;
      }

      setMealPlans(prev => prev.filter(plan => plan.id !== id));
      
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
  };

  const clearWeek = async (weekNumber: 1 | 2) => {
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

      // Remove from local state using stored week number
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
  };

  // Set up real-time subscription for meal plan changes
  useEffect(() => {
    if (!user || !currentHousehold) return;

    const channel = supabase
      .channel('meal-plan-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_meal_plans',
          filter: `household_id=eq.${currentHousehold.id}`
        },
        () => {
          console.log("Meal plan change detected, refetching...");
          fetchMealPlans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentHousehold]);

  return (
    <MealPlanContext.Provider value={{
      mealPlans,
      getMealPlansForWeek,
      getRecipeForMealPlan,
      addMealPlan,
      removeMealPlan,
      clearWeek,
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
