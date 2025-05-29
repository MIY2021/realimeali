import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";

export function useAiRecipeGeneration() {
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [stylePreferences, setStylePreferences] = useState({
    cuisine: "",
    difficulty: "",
    dietaryRestrictions: "",
    cookingTime: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateRecipe = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void
  ) => {
    setIsProcessing(true);
    try {
      console.log('Generating recipe with prompt:', aiPrompt, 'and style preferences:', stylePreferences);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-ai', {
        body: { 
          prompt: aiPrompt,
          stylePreferences: stylePreferences
        }
      });

      if (error) {
        console.error('Error calling generate-recipe-ai function:', error);
        
        // Handle specific error codes
        if (error.message?.includes('RATE_LIMIT')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('INVALID_PROMPT')) {
          toast({
            title: "Invalid Prompt",
            description: "The prompt contains invalid or suspicious content.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation Failed",
            description: "Failed to generate recipe. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (!data?.generatedRecipe) {
        toast({
          title: "No Recipe Generated",
          description: "Could not generate recipe information from the prompt.",
          variant: "destructive",
        });
        return;
      }

      console.log('Received generated recipe:', data.generatedRecipe);
      
      // Sanitize the recipe data before setting
      const sanitizedRecipe = sanitizeRecipeData(data.generatedRecipe);
      setNewRecipe({ ...currentRecipe, ...sanitizedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Generated!",
        description: "Review and edit your recipe in the Manual Entry tab",
      });
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "Generation Error",
        description: "An unexpected error occurred. Please try again.",
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
