
import { useState, useCallback } from "react";
import { MealType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";
import { createMealTypeToCategories, getAllowedCategoriesForMealType } from "@/utils/mealCategoryUtils";
import { MealSelectionState } from "./types";

export const useRandomMealCore = (week: 1 | 2) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes } = useRecipes();
  const { getMealPlansForWeek, addMealPlanWithLeftovers } = useMealPlan();
  const { toast } = useToast();

  const [state, setState] = useState<MealSelectionState>({
    isLoading: false,
    showReplaceDialog: false,
    showQuantityDialog: false,
  });

  console.log("useRandomMealCore initialized for week:", week);
  console.log("Available recipes count:", recipes.length);
  console.log("Current user:", user?.id);
  console.log("Current household:", currentHousehold?.id);

  const performMealSelection = useCallback(async (quantities: Record<MealType, number>) => {
    console.log("=== STARTING MEAL SELECTION ===");
    console.log("User:", user?.id);
    console.log("Household:", currentHousehold?.id);
    console.log("Week:", week);
    console.log("Quantities:", quantities);

    if (!user || !currentHousehold) {
      console.error("Missing user or household for meal selection");
      toast({
        title: "Error",
        description: "Missing user or household information.",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      let totalMealsAdded = 0;

      for (const [mealType, quantity] of Object.entries(quantities) as [MealType, number][]) {
        if (quantity <= 0) {
          console.log(`Skipping ${mealType} - quantity is 0`);
          continue;
        }

        console.log(`Processing ${quantity} meals for ${mealType}`);
        const allowedCategories = getAllowedCategoriesForMealType(mealType);
        console.log(`Allowed categories for ${mealType}:`, allowedCategories);

        const eligibleRecipes = recipes.filter(recipe => 
          allowedCategories.some(category => recipe.categories.includes(category))
        );

        console.log(`Found ${eligibleRecipes.length} eligible recipes for ${mealType}`);

        if (eligibleRecipes.length === 0) {
          console.warn(`No eligible recipes found for ${mealType}`);
          toast({
            title: "No Recipes Available",
            description: `No recipes found for ${mealType}. Please add some recipes with appropriate categories.`,
            variant: "destructive",
          });
          continue;
        }

        // Select random recipes
        const selectedRecipes = [];
        const usedRecipes = new Set();

        for (let i = 0; i < quantity; i++) {
          const availableRecipes = eligibleRecipes.filter(recipe => !usedRecipes.has(recipe.id));
          
          if (availableRecipes.length === 0) {
            // Reuse recipes if we don't have enough unique ones
            const randomRecipe = eligibleRecipes[Math.floor(Math.random() * eligibleRecipes.length)];
            selectedRecipes.push(randomRecipe);
          } else {
            const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            selectedRecipes.push(randomRecipe);
            usedRecipes.add(randomRecipe.id);
          }
        }

        console.log(`Selected ${selectedRecipes.length} recipes for ${mealType}:`, selectedRecipes.map(r => r.title));

        // Add each selected recipe to the meal plan
        for (const recipe of selectedRecipes) {
          console.log(`Adding meal plan for recipe: ${recipe.title} (${recipe.id})`);
          
          try {
            await addMealPlanWithLeftovers({
              date: new Date().toISOString().split('T')[0],
              mealType,
              recipeId: recipe.id,
              createdBy: user.id,
              slotIndex: 0,
              isLeftover: false,
              householdId: currentHousehold.id,
            }, week, 0, true);

            totalMealsAdded++;
            console.log(`Successfully added meal ${totalMealsAdded}`);
          } catch (error) {
            console.error(`Failed to add meal for recipe ${recipe.title}:`, error);
          }
        }
      }

      console.log(`=== MEAL SELECTION COMPLETE ===`);
      console.log(`Total meals added: ${totalMealsAdded}`);
      
      if (totalMealsAdded > 0) {
        toast({
          title: "Meal Plan Generated",
          description: `Successfully added ${totalMealsAdded} meals to Week ${week}!`,
        });
      } else {
        toast({
          title: "No Meals Added",
          description: "Unable to add any meals. Please check your recipes and try again.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Error during meal selection:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, currentHousehold, recipes, addMealPlanWithLeftovers, week, toast]);

  return {
    state,
    setState,
    performMealSelection,
    getMealPlansForWeek,
    recipes,
    user,
    currentHousehold
  };
};
