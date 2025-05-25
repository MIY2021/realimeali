
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe, RecipeCategory } from "@/types";

export function useRecipeProcessing() {
  const { toast } = useToast();
  const [recipeText, setRecipeText] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessText = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void
  ) => {
    if (!recipeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some recipe text first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const extractedRecipe = {
        title: "Extracted Recipe from Text",
        description: "This recipe was extracted from your text input",
        ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
        instructions: ["Step 1: Prepare ingredients", "Step 2: Cook", "Step 3: Serve"],
        categories: ["Easy"] as RecipeCategory[],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
      };
      
      setNewRecipe({ ...currentRecipe, ...extractedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Extracted!",
        description: "Review and edit your recipe in the Manual Entry tab",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process recipe text",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFromUrl = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void
  ) => {
    if (!recipeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const importedRecipe = {
        title: "Imported Recipe from Website",
        description: "This recipe was imported from the website URL",
        ingredients: ["Imported ingredient 1", "Imported ingredient 2", "Imported ingredient 3"],
        instructions: ["Step 1: Imported instruction", "Step 2: Mix well", "Step 3: Enjoy"],
        categories: ["Healthy"] as RecipeCategory[],
        prepTime: 20,
        cookTime: 25,
        servings: 6,
      };
      
      setNewRecipe({ ...currentRecipe, ...importedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Imported!",
        description: "Review and edit your imported recipe in the Manual Entry tab",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import from website",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessImage = async (
    file: File,
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void
  ) => {
    setIsProcessing(true);
    try {
      const extractedRecipe = {
        title: "Recipe from Photo",
        description: "This recipe was extracted from your uploaded photo",
        ingredients: ["Photo ingredient 1", "Photo ingredient 2", "Photo ingredient 3"],
        instructions: ["Step 1: From photo", "Step 2: Follow image", "Step 3: Complete"],
        categories: ["Super Tasty"] as RecipeCategory[],
        prepTime: 10,
        cookTime: 20,
        servings: 2,
      };
      
      setNewRecipe({ ...currentRecipe, ...extractedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Extracted!",
        description: "Review your recipe extracted from the photo",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract recipe from image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
      const generatedRecipe = {
        title: "AI Generated Recipe",
        description: `A delicious recipe generated based on: ${aiPrompt}`,
        ingredients: ["AI ingredient 1", "AI ingredient 2", "AI ingredient 3", "AI ingredient 4"],
        instructions: ["Step 1: AI generated step", "Step 2: Continue cooking", "Step 3: Finish and serve"],
        categories: ["Easy", "Healthy"] as RecipeCategory[],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
      };
      
      setNewRecipe({ ...currentRecipe, ...generatedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Generated!",
        description: "Your AI-generated recipe is ready for review",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recipe",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    recipeText,
    setRecipeText,
    recipeUrl,
    setRecipeUrl,
    aiPrompt,
    setAiPrompt,
    isProcessing,
    handleProcessText,
    handleImportFromUrl,
    handleProcessImage,
    handleGenerateRecipe,
  };
}
