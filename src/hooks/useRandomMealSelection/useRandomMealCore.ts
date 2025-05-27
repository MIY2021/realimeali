
import { useState } from "react";
import { MealType, RecipeCategory } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { createMealTypeToCategories } from "@/utils/mealCategoryUtils";
import { toast } from "sonner";
import { MealSelectionState, DEFAULT_MEAL_QUANTITIES } from "./types";

export const useRandomMealCore = (week: 1 | 2) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { clearWeek, addMealPlan, getMealPlansForWeek } = useMealPlan();
  
  const [state, setState] = useState<MealSelectionState>({
    isLoading: false,
    showReplaceDialog: false,
    showQuantityDialog: false,
  });

  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];
  const mealTypeToCategories = createMealTypeToCategories();

  const getUniqueRandomRecipes = (
    availableRecipes: typeof recipes,
    categories: RecipeCategory[],
    count: number,
    excludeIds: Set<string>
  ) => {
    console.log(`Looking for recipes with categories: ${categories.join(', ')}`);
    console.log(`Total available recipes: ${availableRecipes.length}`);
    
    const pool = availableRecipes.filter(r => {
      const hasCategory = r.categories.some(cat => categories.includes(cat as RecipeCategory));
      const notExcluded = !excludeIds.has(r.id);
      console.log(`Recipe "${r.title}": categories=${r.categories}, hasCategory=${hasCategory}, notExcluded=${notExcluded}`);
      return hasCategory && notExcluded;
    });
    
    console.log(`Filtered recipe pool size: ${pool.length}`);
    
    if (pool.length === 0) {
      console.warn(`No recipes found for categories: ${categories.join(', ')}`);
      return [];
    }
    
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const result = [];
    const seen = new Set(excludeIds);
    for (let recipe of shuffled) {
      if (!seen.has(recipe.id)) {
        result.push(recipe);
        seen.add(recipe.id);
        if (result.length === count) break;
      }
    }
    return result;
  };

  const performMealSelection = async (customQuantities?: Record<MealType, number>) => {
    console.log("Starting random meal selection...");
    console.log("Available recipes:", recipes.length);
    console.log("Recipes:", recipes.map(r => ({ title: r.title, categories: r.categories })));
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    const loadingToastId = toast.loading("Generating your personalized meal plan...");
    
    try {
      console.log("Clearing week", week);
      await clearWeek(week);
      
      const quantities = customQuantities || DEFAULT_MEAL_QUANTITIES;
      let allSelectedIds = new Set<string>();
      let totalMealsAdded = 0;
      let partialResults: string[] = [];
      let skippedMealTypes: string[] = [];
      
      for (const mealType of mealTypes) {
        console.log(`Selecting recipes for ${mealType}...`);
        
        const allowedCategories = mealTypeToCategories[mealType];
        console.log(`Allowed categories for ${mealType}:`, allowedCategories);
        
        const desiredCount = quantities[mealType];
        const unique = getUniqueRandomRecipes(
          recipes,
          allowedCategories,
          desiredCount,
          allSelectedIds
        );
        
        if (unique.length === 0) {
          console.warn(`No recipes available for ${mealType} with categories: ${allowedCategories.join(', ')}`);
          skippedMealTypes.push(mealType);
          continue;
        }
        
        if (unique.length < desiredCount) {
          partialResults.push(`${mealType}: ${unique.length}/${desiredCount} recipes`);
        }
        
        console.log(`Found ${unique.length} recipes for ${mealType}:`, unique.map(r => r.title));
        
        for (const [i, recipe] of unique.entries()) {
          console.log(`Adding ${recipe.title} to ${mealType} slot ${i}`);
          
          await addMealPlan({
            date: new Date().toISOString().split('T')[0],
            mealType: mealType,
            recipeId: recipe.id,
            createdBy: user.id,
            slotIndex: i,
            isLeftover: false,
            householdId: currentHousehold.id,
          }, week, true);
          
          allSelectedIds.add(recipe.id);
          totalMealsAdded++;
        }
      }
      
      console.log("Random meal selection completed");
      
      toast.dismiss(loadingToastId);
      
      if (totalMealsAdded === 0) {
        toast.error("No meals generated. Try adding more recipes with appropriate categories.");
      } else if (skippedMealTypes.length > 0) {
        toast.success(`Generated ${totalMealsAdded} meals! Skipped ${skippedMealTypes.join(', ')} due to no available recipes.`);
      } else if (partialResults.length > 0) {
        toast.success(`Generated ${totalMealsAdded} meals! Note: ${partialResults.join(', ')} - not enough recipes available.`);
      } else {
        toast.success(`🎉 Generated ${totalMealsAdded} delicious meals from your recipe collection!`);
      }
    } catch (error) {
      console.error("Error during random meal selection:", error);
      toast.dismiss(loadingToastId);
      toast.error("Failed to generate meal plan. Please try again.");
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    state,
    setState,
    performMealSelection,
    getMealPlansForWeek,
    recipes,
    user,
    currentHousehold,
  };
};
