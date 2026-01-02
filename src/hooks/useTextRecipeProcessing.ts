
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";
import { normalizeCuisineRegion } from "@/utils/recipeClassification";

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
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Processing Timeout",
        description: "Text processing is taking too long. Please try again with shorter text or check your connection.",
        variant: "destructive",
      });
    }, 60000); // 60 second timeout

    try {
      console.log('Processing recipe text:', recipeText.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          recipeText: recipeText.trim(),
          preserveQuantities: true // Add flag to preserve quantities
        }
      });

      clearTimeout(timeoutId); // Clear timeout on success

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
        // Store group indices from AI parsing
        ingredient_group_indices: Array.isArray(data.parsedRecipe.ingredientGroupIndices) 
          ? data.parsedRecipe.ingredientGroupIndices 
          : undefined,
        // Apply AI classification
        meal_type: data.parsedRecipe.mealType || currentRecipe.meal_type,
        cuisine_region: normalizeCuisineRegion(data.parsedRecipe.cuisineRegion) || currentRecipe.cuisine_region,
        diet_lifestyle: data.parsedRecipe.dietLifestyle || currentRecipe.diet_lifestyle || [],
        // complexity_level removed
        top_tip: data.parsedRecipe.topTip || "Enjoy cooking this delicious recipe!",
        alcoholic_pairing: data.parsedRecipe.alcoholicPairing || null,
        non_alcoholic_pairing: data.parsedRecipe.nonAlcoholicPairing || null,
      };
      
      setNewRecipe(recipeData);
      setActiveTab("manual");
      
      toast({
        title: "Recipe Processed! 🎉",
        description: "Your recipe has been organized and categorized automatically with quantities preserved.",
      });

      // Clear the text input on success
      setRecipeText("");
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error processing recipe text:', error);
      
      let errorMessage = "Failed to process recipe text. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('network')) {
          errorMessage = "Connection timeout. Please check your internet and try again.";
        } else if (error.message.includes('rate limit')) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        }
      }
      
      toast({
        title: "Processing Failed",
        description: errorMessage,
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
