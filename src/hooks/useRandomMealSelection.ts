
import { useState } from "react";
import { MealType, RecipeCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { createMealTypeToCategories } from "@/utils/mealCategoryUtils";

// Define desired quantities for each meal type
const MEAL_TYPE_QUANTITIES: Record<MealType, number> = {
  dinner: 5,
  lunch: 3,
  breakfast: 2,
  snacks: 2,
};

export const useRandomMealSelection = (week: 1 | 2) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { getMealPlansForWeek, addMealPlan, clearWeek } = useMealPlan();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);

  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];
  
  // Use dynamic category mappings
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

  const performMealSelection = async () => {
    console.log("Starting random meal selection...");
    console.log("Available recipes:", recipes.length);
    console.log("Recipes:", recipes.map(r => ({ title: r.title, categories: r.categories })));
    
    setIsLoading(true);
    
    try {
      console.log("Clearing week", week);
      await clearWeek(week);
      
      let allSelectedIds = new Set<string>();
      let totalMealsAdded = 0;
      let partialResults: string[] = [];
      let skippedMealTypes: string[] = [];
      
      for (const mealType of mealTypes) {
        console.log(`Selecting recipes for ${mealType}...`);
        
        const allowedCategories = mealTypeToCategories[mealType];
        console.log(`Allowed categories for ${mealType}:`, allowedCategories);
        
        const desiredCount = MEAL_TYPE_QUANTITIES[mealType];
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
          }, week);
          
          allSelectedIds.add(recipe.id);
          totalMealsAdded++;
        }
      }
      
      console.log("Random meal selection completed");
      
      // Provide appropriate feedback based on results
      if (totalMealsAdded === 0) {
        toast({
          title: "No Meals Generated",
          description: "No recipes were found with the appropriate categories for meal planning. Try adding more recipes with Breakfast, Lunch, or Snacks categories.",
          variant: "destructive",
        });
      } else if (skippedMealTypes.length > 0) {
        toast({
          title: "Meal Plan Partially Generated",
          description: `Generated ${totalMealsAdded} meals! Skipped ${skippedMealTypes.join(', ')} due to no available recipes with appropriate categories.`,
        });
      } else if (partialResults.length > 0) {
        toast({
          title: "Meal Plan Generated",
          description: `Generated ${totalMealsAdded} meals! Note: ${partialResults.join(', ')} - not enough recipes available for full quantities.`,
        });
      } else {
        toast({
          title: "Meal Plan Generated",
          description: `Successfully generated ${totalMealsAdded} meals from your recipe collection!`,
        });
      }
    } catch (error) {
      console.error("Error during random meal selection:", error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomize = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to generate meals.",
        variant: "destructive",
      });
      return;
    }

    if (!currentHousehold) {
      toast({
        title: "No Household Selected",
        description: "Please select or create a household to manage meal plans.",
        variant: "destructive",
      });
      return;
    }

    console.log("Checking recipes availability...");
    console.log("Recipes array length:", recipes.length);
    console.log("Sample recipes:", recipes.slice(0, 3).map(r => ({ title: r.title, categories: r.categories })));

    if (recipes.length === 0) {
      toast({
        title: "No Recipes Available",
        description: "You need to create some recipes first before generating meals.",
        variant: "destructive",
      });
      return;
    }

    const currentWeekPlans = getMealPlansForWeek(week);
    if (currentWeekPlans.length > 0) {
      setShowReplaceDialog(true);
      return;
    }
    
    await performMealSelection();
  };

  return { 
    handleRandomize, 
    performMealSelection,
    isLoading,
    showReplaceDialog,
    setShowReplaceDialog
  };
};
