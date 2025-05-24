
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MealPlan, Recipe } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { mockMealPlans } from "@/data/mealPlans";

interface MealPlanContextType {
  mealPlans: MealPlan[];
  getMealPlansForWeek: (weekNumber: 1 | 2) => MealPlan[];
  getRecipeForMealPlan: (mealPlan: MealPlan) => Recipe | undefined;
  addMealPlan: (mealPlan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeMealPlan: (id: string) => void;
  clearWeek: (weekNumber: 1 | 2) => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const MealPlanProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  // Load meal plans from localStorage on mount
  useEffect(() => {
    if (!user) {
      setMealPlans([]);
      return;
    }

    const week1Plans = JSON.parse(localStorage.getItem(`persistedMealPlans_v1_week1`) || '[]');
    const week2Plans = JSON.parse(localStorage.getItem(`persistedMealPlans_v1_week2`) || '[]');
    
    // Filter meal plans to only include those with recipes that exist in user's collection
    const userRecipeIds = new Set(recipes.map(r => r.id));
    const validWeek1Plans = week1Plans.filter((plan: MealPlan) => userRecipeIds.has(plan.recipeId));
    const validWeek2Plans = week2Plans.filter((plan: MealPlan) => userRecipeIds.has(plan.recipeId));
    
    const allPlans = [...validWeek1Plans, ...validWeek2Plans];
    setMealPlans(allPlans);
  }, [user, recipes]);

  const getMealPlansForWeek = (weekNumber: 1 | 2): MealPlan[] => {
    if (!user) return [];
    
    // Only return meal plans that reference existing user recipes
    const userRecipeIds = new Set(recipes.map(r => r.id));
    return mealPlans.filter(plan => {
      const storageKey = `persistedMealPlans_v1_week${weekNumber}`;
      const weekPlans = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const planExists = weekPlans.some((p: MealPlan) => p.id === plan.id);
      return planExists && userRecipeIds.has(plan.recipeId);
    });
  };

  const getRecipeForMealPlan = (mealPlan: MealPlan): Recipe | undefined => {
    // Only return recipe if it exists in user's collection
    return recipes.find(recipe => recipe.id === mealPlan.recipeId);
  };

  const addMealPlan = (mealPlanData: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    // Verify the recipe exists in user's collection
    const recipeExists = recipes.some(recipe => recipe.id === mealPlanData.recipeId);
    if (!recipeExists) {
      console.warn('Cannot add meal plan: recipe not found in user collection');
      return;
    }

    const newMealPlan: MealPlan = {
      ...mealPlanData,
      id: `meal-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Determine week based on meal plan (you might want to add week info to the data)
    // For now, we'll default to week 1, but this should be improved
    const weekNumber = 1; // This should come from the mealPlanData
    const storageKey = `persistedMealPlans_v1_week${weekNumber}`;
    const existingPlans = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedPlans = [...existingPlans, newMealPlan];
    localStorage.setItem(storageKey, JSON.stringify(updatedPlans));

    setMealPlans(prev => [...prev, newMealPlan]);
  };

  const removeMealPlan = (id: string) => {
    if (!user) return;

    // Remove from both weeks' storage
    [1, 2].forEach(weekNumber => {
      const storageKey = `persistedMealPlans_v1_week${weekNumber}`;
      const existingPlans = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const filteredPlans = existingPlans.filter((plan: MealPlan) => plan.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(filteredPlans));
    });

    setMealPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const clearWeek = (weekNumber: 1 | 2) => {
    if (!user) return;

    const storageKey = `persistedMealPlans_v1_week${weekNumber}`;
    localStorage.removeItem(storageKey);
    
    // Remove from state
    const weekPlans = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const weekPlanIds = weekPlans.map((plan: MealPlan) => plan.id);
    setMealPlans(prev => prev.filter(plan => !weekPlanIds.includes(plan.id)));
  };

  return (
    <MealPlanContext.Provider value={{
      mealPlans,
      getMealPlansForWeek,
      getRecipeForMealPlan,
      addMealPlan,
      removeMealPlan,
      clearWeek
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
