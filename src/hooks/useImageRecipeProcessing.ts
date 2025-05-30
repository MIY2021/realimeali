
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";

export function useImageRecipeProcessing() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessImage = async (
    file: File,
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void
  ) => {
    setIsProcessing(true);
    try {
      console.log('Processing image file:', file.name, file.type);
      
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('Image converted to base64, calling AI...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { imageUrl: imageDataUrl }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to extract recipe from image');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data could be extracted from the image');
      }

      console.log('Received recipe from image:', data.parsedRecipe);
      
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
        title: "Recipe Extracted! 🎉",
        description: "Recipe extracted from photo and auto-categorized successfully.",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to extract recipe from image. Please try with a clearer image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleProcessImage,
  };
}
