
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { validateInput, recipeTextSchema } from "@/utils/inputValidation";
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
    // Validate input
    const validation = validateInput(recipeTextSchema, recipeText.trim());
    if (!validation.success) {
      toast({
        title: "Invalid Input",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Processing recipe text:', recipeText.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { recipeText: validation.data }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        
        // Handle specific error codes
        if (error.message?.includes('RATE_LIMIT')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('INVALID_TEXT')) {
          toast({
            title: "Invalid Content",
            description: "The text contains invalid or suspicious content.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Processing Error",
            description: "Failed to process recipe text. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (!data?.parsedRecipe) {
        toast({
          title: "No Recipe Found",
          description: "Could not extract recipe information from the text.",
          variant: "destructive",
        });
        return;
      }

      console.log('Received parsed recipe:', data.parsedRecipe);
      
      // Sanitize the recipe data before setting
      const sanitizedRecipe = sanitizeRecipeData(data.parsedRecipe);
      setNewRecipe({ ...currentRecipe, ...sanitizedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Extracted!",
        description: "Review and edit your recipe in the Manual Entry tab",
      });
    } catch (error) {
      console.error('Error processing recipe text:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
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
