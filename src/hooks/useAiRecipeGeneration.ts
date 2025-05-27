
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useAiRecipeGeneration() {
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const buildEnhancedPrompt = (basePrompt: string, styles: string[]) => {
    let enhancedPrompt = `Generate a complete recipe based on this request: ${basePrompt.trim()}`;
    
    if (styles.length > 0) {
      enhancedPrompt += "\n\nPlease tailor the recipe according to these style preferences:\n";
      
      if (styles.includes("quick-easy")) {
        enhancedPrompt += "- QUICK & EASY: Focus on simple techniques, minimal prep time (under 30 minutes total), and readily available ingredients. Avoid complex cooking methods.\n";
      }
      
      if (styles.includes("cheap-cheerful")) {
        enhancedPrompt += "- CHEAP & CHEERFUL: Use budget-friendly ingredients, larger portions, and cost-effective cooking methods. Focus on hearty, satisfying meals that don't break the bank.\n";
      }
      
      if (styles.includes("michelin-star")) {
        enhancedPrompt += "- MICHELIN STAR: Create an elevated, restaurant-quality dish with sophisticated techniques, premium ingredients, and elegant presentation. Include detailed plating instructions.\n";
      }
    }
    
    enhancedPrompt += "\n\nIMPORTANT: Please also include a helpful 'topTip' - a cooking tip, secret, or pro advice that will help make this recipe even better. This could be about technique, ingredient substitutions, timing, or any insider knowledge that would elevate the dish.";
    
    return enhancedPrompt;
  };

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
      console.log('Style preferences:', stylePreferences);
      
      const enhancedPrompt = buildEnhancedPrompt(aiPrompt, stylePreferences);
      console.log('Enhanced prompt:', enhancedPrompt);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { recipeText: enhancedPrompt }
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
    stylePreferences,
    setStylePreferences,
    isProcessing,
    handleGenerateRecipe,
  };
}
