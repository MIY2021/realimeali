
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
        title: "Missing Input",
        description: "Please describe the recipe you'd like to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Generating AI recipe with prompt:', aiPrompt, 'and style preferences:', stylePreferences);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          generateRequest: aiPrompt,
          stylePreferences: stylePreferences
        }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        
        // Handle specific error types
        if (error.message?.includes('Resource unavailable')) {
          toast({
            title: "AI Service Busy",
            description: "The AI service is temporarily busy. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes('timeout')) {
          toast({
            title: "Generation Timeout",
            description: "Recipe generation took too long. Please try with a simpler request.",
            variant: "destructive",
          });
        } else if (error.message?.includes('rate limit')) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation Error",
            description: "Failed to generate recipe. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (!data?.parsedRecipe) {
        toast({
          title: "Generation Failed",
          description: "Could not generate a recipe from your request. Please try rephrasing it.",
          variant: "destructive",
        });
        return;
      }

      console.log('Received generated recipe:', data.parsedRecipe);
      
      // Apply the generated recipe data
      const generatedRecipe = {
        ...currentRecipe,
        ...data.parsedRecipe
      };
      
      setNewRecipe(generatedRecipe);
      setActiveTab("manual");
      
      toast({
        title: "Recipe Generated! 🎉",
        description: "Your custom recipe has been created. Review and edit it in the Manual Entry tab.",
      });
      
      // Clear the prompt after successful generation
      setAiPrompt("");
      
    } catch (error) {
      console.error('Error generating recipe:', error);
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
    aiPrompt,
    setAiPrompt,
    stylePreferences,
    setStylePreferences,
    isProcessing,
    handleGenerateRecipe,
  };
}
