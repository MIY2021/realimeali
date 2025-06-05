
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { toast } from "sonner";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";

export function useImageRecipeProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [progressValue, setProgressValue] = useState(0);

  const processImage = async (
    file: File,
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void,
    searchRecipeImages?: (title: string) => Promise<string[]>
  ) => {
    setIsProcessing(true);
    setProgressValue(0);
    setImportProgress("📷 Reading recipe from image...");

    try {
      // Convert image to base64
      setProgressValue(20);
      setImportProgress("📷 Preparing image for analysis...");
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProgressValue(40);
      setImportProgress("🤖 AI is reading the recipe text...");

      console.log('📷 Processing image with AI:', file.name);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          image: base64,
          mimeType: file.type
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data could be extracted from the image');
      }

      setProgressValue(80);
      setImportProgress("✨ Organizing recipe data...");

      console.log('✅ Recipe extracted from image:', data.parsedRecipe);

      // Sanitize the recipe data
      const sanitizedRecipe = sanitizeRecipeData(data.parsedRecipe);
      
      // Apply AI categorization
      const recipeData = { 
        ...currentRecipe, 
        ...sanitizedRecipe,
        meal_type: data.parsedRecipe.mealType || currentRecipe.meal_type,
        cuisine_region: data.parsedRecipe.cuisineRegion || currentRecipe.cuisine_region,
        diet_lifestyle: data.parsedRecipe.dietLifestyle || currentRecipe.diet_lifestyle || [],
        complexity_level: data.parsedRecipe.complexityLevel || currentRecipe.complexity_level,
        main_ingredient: data.parsedRecipe.mainIngredient || currentRecipe.main_ingredient,
        top_tip: data.parsedRecipe.topTip || "Enjoy cooking this delicious recipe!"
      };

      setProgressValue(90);
      setImportProgress("🔍 Searching for recipe images...");

      // Search for images if the recipe has a title and search function is available
      if (recipeData.title && searchRecipeImages) {
        console.log('🔍 Searching for images for processed recipe:', recipeData.title);
        await searchRecipeImages(recipeData.title);
      }

      setProgressValue(100);
      setImportProgress("✅ Recipe imported successfully!");

      setNewRecipe(recipeData);
      setActiveTab("manual");
      
      toast.success("Recipe imported from image!", {
        description: `Successfully extracted "${recipeData.title}" from your photo`
      });

    } catch (error) {
      console.error('❌ Error processing image:', error);
      toast.error("Failed to process image", {
        description: error instanceof Error ? error.message : "Please try again with a clearer image"
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setImportProgress("");
        setProgressValue(0);
      }, 3000);
    }
  };

  return {
    processImage,
    isProcessing,
    importProgress,
    progressValue,
  };
}
