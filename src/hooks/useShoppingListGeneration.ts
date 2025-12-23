
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";

export const useShoppingListGeneration = (
  weekKey: string,
  clearAll: () => Promise<void>,
  refreshList: () => Promise<void>
) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { toast } = useToast();
  const { generateAndSaveFromMealPlans } = useShoppingListGenerator();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    step: 0,
    totalSteps: 4,
    currentAction: ''
  });
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const mealPlans = getMealPlansForWeek(weekKey);
  const hasMealPlans = mealPlans.length > 0;

  const handleGenerate = useCallback(async () => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "Please log in and select a household",
        variant: "destructive",
      });
      return;
    }

    if (recipesLoading) {
      toast({
        title: "Please wait",
        description: "Recipes are still loading...",
        variant: "destructive",
      });
      return;
    }

    if (recipes.length === 0) {
      toast({
        title: "No recipes",
        description: "No recipes found. Please add some recipes first.",
        variant: "destructive",
      });
      return;
    }

    if (!hasMealPlans) {
      toast({
        title: "No meal plans",
        description: `Please add some meal plans for this week first`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ step: 1, totalSteps: 4, currentAction: 'Getting ready...' });

    try {
      // Clear the UI immediately for better user experience
      await clearAll();
      
      setGenerationProgress({ step: 2, totalSteps: 4, currentAction: 'Looking through your meal plan...' });
      
      const startTime = performance.now();
      const result = await generateAndSaveFromMealPlans(weekKey);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      setGenerationProgress({ step: 3, totalSteps: 4, currentAction: 'Organizing your shopping list...' });
      
      // Set the generation time
      setLastGenerated(new Date());
      
      // Force refresh the list after generation
      setTimeout(async () => {
        setGenerationProgress({ step: 4, totalSteps: 4, currentAction: 'Almost done!' });
        await refreshList();
        
        if (result && result.length > 0) {
          toast({
            title: "Shopping list generated!",
            description: `Shopping list created with ${result.length} items in ${duration}ms`,
          });
        } else {
          toast({
            title: "No items created",
            description: "No ingredients were found to add to the shopping list",
            variant: "destructive",
          });
        }
      }, 500);
      
    } catch (error) {
      console.error('Error generating shopping list:', error);
      toast({
        title: "Error",
        description: `Failed to generate shopping list: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress({ step: 0, totalSteps: 4, currentAction: '' });
      }, 1000);
    }
  }, [user, currentHousehold, recipesLoading, recipes, hasMealPlans, weekKey, clearAll, generateAndSaveFromMealPlans, refreshList, toast]);

  return {
    isGenerating,
    generationProgress,
    lastGenerated,
    setLastGenerated,
    handleGenerate
  };
};
