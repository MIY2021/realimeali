
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";

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
      // Temporarily disable AI generation to prevent crashes
      toast({
        title: "Feature Coming Soon",
        description: "AI recipe generation is currently being updated and will be available soon!",
      });
      
      // TODO: Implement AI recipe generation when edge function is ready
      console.log('AI Generation requested with prompt:', aiPrompt, 'and style preferences:', stylePreferences);
      
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
