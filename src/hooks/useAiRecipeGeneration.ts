
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";

export function useAiRecipeGeneration() {
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateRecipe = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void
  ) => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what recipe you'd like me to create",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Generating AI recipe for:', aiPrompt);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          generateRequest: aiPrompt.trim(),
          stylePreferences: stylePreferences
        }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to generate recipe');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe could be generated');
      }

      console.log('Received generated recipe:', data.parsedRecipe);
      
      // Sanitize the recipe data
      const sanitizedRecipe = sanitizeRecipeData(data.parsedRecipe);
      
      // Apply AI categorization
      const recipeData = { 
        ...currentRecipe, 
        ...sanitizedRecipe,
        // Apply AI classification
        meal_type: data.parsedRecipe.mealType || currentRecipe.meal_type,
        cuisine: data.parsedRecipe.cuisineRegion || currentRecipe.cuisine,
        cooking_method: data.parsedRecipe.cookingMethod || currentRecipe.cooking_method,
        diet_lifestyle: data.parsedRecipe.dietLifestyle || currentRecipe.diet_lifestyle || [],
        complexity_level: data.parsedRecipe.complexityLevel || currentRecipe.complexity_level,
        main_ingredient: data.parsedRecipe.mainIngredient || currentRecipe.main_ingredient,
        top_tip: data.parsedRecipe.topTip || "Enjoy cooking this delicious recipe!"
      };
      
      setNewRecipe(recipeData);
      setActiveTab("manual");
      
      toast({
        title: "Recipe Generated! 🎉",
        description: "Your custom recipe has been created and categorized automatically.",
      });
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    aiPrompt,
    setAiPrompt,
    stylePreferences,
    setStylePreferences,
    isProcessing,
    handleGenerateRecipe,
  };
}
