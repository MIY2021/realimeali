
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useAiRecipeGeneration() {
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateRecipe = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void
  ) => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what kind of recipe you want",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Generating recipe with AI prompt:', aiPrompt);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { recipeText: `Generate a complete recipe based on this request: ${aiPrompt.trim()}` }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to generate recipe');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe was generated from your request');
      }

      console.log('Received generated recipe:', data.parsedRecipe);
      
      setNewRecipe({ ...currentRecipe, ...data.parsedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Generated!",
        description: "Your AI-generated recipe is ready for review",
      });
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recipe. Please try again with a different prompt.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    aiPrompt,
    setAiPrompt,
    isProcessing,
    handleGenerateRecipe,
  };
}
