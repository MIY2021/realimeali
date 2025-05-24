
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
      setMealPlans([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('household_meal_plans')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

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
      }));

      // Filter to only include meal plans with recipes that exist in household members' collections
      const userRecipeIds = new Set(recipes.map(r => r.id));
      const validPlans = transformedPlans.filter(plan => userRecipeIds.has(plan.recipeId));
      
      setMealPlans(validPlans);
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
  }, [user, currentHousehold, recipes]);

  const getMealPlansForWeek = (weekNumber: 1 | 2): MealPlan[] => {
    if (!user || !currentHousehold) return [];
    
    return mealPlans.filter(plan => {
      // Get the week_number from the database record
      const planDate = new Date(plan.date);
      const currentWeek = Math.ceil(planDate.getDate() / 7);
      return currentWeek === weekNumber;
    });
  };

  const getRecipeForMealPlan = (mealPlan: MealPlan): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === mealPlan.recipeId);
  };

  const addMealPlan = async (mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>, weekNumber: 1 | 2) => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "You must be logged in and have a current household to add meal plans.",
        variant: "destructive",
      });
      return;
    }

    // Verify the recipe exists in user's collection
    const recipeExists = recipes.some(recipe => recipe.id === mealPlanData.recipeId);
    if (!recipeExists) {
      toast({
        title: "Error",
        description: "Recipe not found in your collection.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Adding meal plan:", { mealPlanData, weekNumber });
      
      const { data, error } = await supabase
        .from('household_meal_plans')
        .insert([{
          household_id: currentHousehold.id,
          recipe_id: mealPlanData.recipeId,
          meal_type: mealPlanData.mealType,
          week_number: weekNumber,
          slot_index: mealPlanData.slotIndex,
          notes: mealPlanData.notes,
          date_scheduled: mealPlanData.date,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Meal plan added successfully:", data);

      // Add to local state
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
      };

      setMealPlans(prev => [...prev, newMealPlan]);
      
      toast({
        title: "Recipe Added",
        description: "Recipe has been added to your meal plan.",
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
      const { error } = await supabase
        .from('household_meal_plans')
        .delete()
        .eq('id', id)
        .eq('household_id', currentHousehold.id);

      if (error) {
        throw error;
      }

      setMealPlans(prev => prev.filter(plan => plan.id !== id));
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
      const { error } = await supabase
        .from('household_meal_plans')
        .delete()
        .eq('household_id', currentHousehold.id)
        .eq('week_number', weekNumber);

      if (error) {
        throw error;
      }

      // Remove from local state
      const weekPlans = getMealPlansForWeek(weekNumber);
      const weekPlanIds = weekPlans.map(plan => plan.id);
      setMealPlans(prev => prev.filter(plan => !weekPlanIds.includes(plan.id)));
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
          // Refetch meal plans when changes occur
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
