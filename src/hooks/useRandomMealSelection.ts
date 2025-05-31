
import { useState } from "react";
import { Recipe, MealType } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";

interface MealQuantities {
  dinner: number;
  lunch: number;
  breakfast: number;
  snacks: number;
  sides: number;
  desserts: number;
  drinks: number;
}

export function useRandomMealSelection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { recipes } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { addMealPlan } = useMealPlan();

  const generateRandomMealPlan = async (quantities: MealQuantities, weekNumber: 1 | 2) => {
    if (!user || !currentHousehold) {
      throw new Error('User and household are required');
    }

    setIsGenerating(true);
    
    try {
      console.log('Starting meal plan generation for week', weekNumber);
      console.log('Available recipes:', recipes.length);
      console.log('Requested quantities:', quantities);

      let totalAdded = 0;
      
      // Generate meals for each meal type
      for (const [mealType, count] of Object.entries(quantities)) {
        if (count === 0) continue;
        
        console.log(`Processing ${mealType}: ${count} meals`);
        
        // Filter recipes for this meal type
        let availableRecipes = recipes.filter(recipe => {
          if (recipe.meal_type === mealType) return true;
          // If recipe has no meal_type and we're looking for dinner, include it
          if (!recipe.meal_type && mealType === "dinner") return true;
          return false;
        });
        
        console.log(`Found ${availableRecipes.length} recipes for ${mealType}`);
        
        // If no specific recipes found and it's not dinner, try to find some general recipes
        if (availableRecipes.length === 0 && mealType !== "dinner") {
          availableRecipes = recipes.filter(recipe => !recipe.meal_type).slice(0, 5);
          console.log(`Using general recipes for ${mealType}: ${availableRecipes.length}`);
        }
        
        // Add the requested number of meals
        for (let i = 0; i < count; i++) {
          if (availableRecipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            const randomRecipe = availableRecipes[randomIndex];
            
            try {
              console.log(`Adding ${randomRecipe.title} to ${mealType} (${i + 1}/${count})`);
              
              await addMealPlan({
                recipe_id: randomRecipe.id,
                meal_type: mealType as MealType,
                date: new Date().toISOString().split('T')[0],
                created_by: user.id,
                slot_index: i,
                is_leftover: false,
                household_id: currentHousehold.id,
                week_number: weekNumber,
                original_servings: randomRecipe.servings,
              }, weekNumber, true); // Silent mode to avoid multiple toasts
              
              totalAdded++;
              console.log(`Successfully added ${randomRecipe.title}`);
              
              // Remove the recipe from available list to avoid duplicates in same meal type
              availableRecipes.splice(randomIndex, 1);
              
              // If we run out of recipes, reset the list
              if (availableRecipes.length === 0) {
                availableRecipes = recipes.filter(recipe => {
                  if (recipe.meal_type === mealType) return true;
                  if (!recipe.meal_type && mealType === "dinner") return true;
                  return false;
                });
              }
            } catch (error) {
              console.error(`Error adding ${randomRecipe.title} to meal plan:`, error);
            }
          } else {
            console.log(`No recipes available for ${mealType}`);
          }
        }
      }

      console.log(`Successfully added ${totalAdded} meals to the plan`);
      return totalAdded;
    } catch (error) {
      console.error("Error generating meal plan:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRandomMealPlan,
    isGenerating
  };
}
