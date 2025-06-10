
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";

export function useTextRecipeProcessing() {
  const { toast } = useToast();
  const [recipeText, setRecipeText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessText = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void
  ) => {
    if (!recipeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some recipe text to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Processing recipe text:', recipeText.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          recipeText: recipeText.trim(),
          preserveQuantities: true // Add flag to preserve quantities
        }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to process recipe text');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data could be extracted from the text');
      }

      console.log('Received processed recipe:', data.parsedRecipe);
      
      // Sanitize the recipe data while preserving original ingredient formatting
      const sanitizedRecipe = sanitizeRecipeData(data.parsedRecipe);
      
      // Ensure ingredients maintain their original quantities and formatting
      const recipeData = { 
        ...currentRecipe, 
        ...sanitizedRecipe,
        // Preserve original ingredient strings with quantities
        ingredients: data.parsedRecipe.ingredients || sanitizedRecipe.ingredients || [],
        // Apply AI classification
        meal_type: data.parsedRecipe.mealType || currentRecipe.meal_type,
        cuisine_region: data.parsedRecipe.cuisineRegion || currentRecipe.cuisine_region,
        diet_lifestyle: data.parsedRecipe.dietLifestyle || currentRecipe.diet_lifestyle || [],
        complexity_level: data.parsedRecipe.complexityLevel || currentRecipe.complexity_level,
        main_ingredient: data.parsedRecipe.mainIngredient || currentRecipe.main_ingredient,
        top_tip: data.parsedRecipe.topTip || "Enjoy cooking this delicious recipe!"
      };
      
      setNewRecipe(recipeData);
      setActiveTab("manual");
      
      toast({
        title: "Recipe Processed! 🎉",
        description: "Your recipe has been organized and categorized automatically with quantities preserved.",
      });
    } catch (error) {
      console.error('Error processing recipe text:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process recipe text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    recipeText,
    setRecipeText,
    isProcessing,
    handleProcessText,
  };
}
