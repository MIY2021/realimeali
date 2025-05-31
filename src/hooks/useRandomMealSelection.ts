
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

      // Generate meals for all meal types
      const mealTypesToGenerate: Array<{ type: MealType; count: number }> = [
        { type: "dinner", count: quantities.dinner },
        { type: "lunch", count: quantities.lunch },
        { type: "breakfast", count: quantities.breakfast },
        { type: "snacks", count: quantities.snacks },
        { type: "sides", count: quantities.sides },
        { type: "desserts", count: quantities.desserts },
        { type: "drinks", count: quantities.drinks }
      ];

      let totalAdded = 0;
      
      for (const { type, count } of mealTypesToGenerate) {
        if (count === 0) continue;
        
        const availableRecipes = recipes.filter(recipe => 
          recipe.meal_type === type || (!recipe.meal_type && type === "dinner")
        );
        
        console.log(`Found ${availableRecipes.length} recipes for ${type}`);
        
        for (let i = 0; i < count; i++) {
          if (availableRecipes.length > 0) {
            const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            
            try {
              // Add the meal to the plan
              await addMealPlan({
                recipe_id: randomRecipe.id,
                meal_type: type,
                date: new Date().toISOString().split('T')[0],
                created_by: user.id,
                slot_index: i,
                is_leftover: false,
                household_id: currentHousehold.id,
                week_number: weekNumber,
                original_servings: randomRecipe.servings,
              }, weekNumber, true); // Silent mode to avoid multiple toasts
              
              totalAdded++;
              console.log(`Added ${randomRecipe.title} to ${type}`);
            } catch (error) {
              console.error(`Error adding ${randomRecipe.title} to meal plan:`, error);
            }
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
