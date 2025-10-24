
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";

export function useImageRecipeProcessing() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [progressValue, setProgressValue] = useState(0);

  const processImage = async (file: File) => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image file to process",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);
    setImportProgress("Reading image...");
    setProgressValue(10);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setImportProgress("Processing image with AI...");
      setProgressValue(30);

      console.log('Processing image with AI...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          imageData: base64,
          extractRecipe: true
        }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to process recipe image');
      }

      setImportProgress("Extracting recipe data...");
      setProgressValue(70);

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data could be extracted from this image');
      }

      console.log('Received processed recipe from image:', data.parsedRecipe);
      
      setImportProgress("Finalizing recipe...");
      setProgressValue(90);

      // Sanitize the recipe data
      const sanitizedRecipe = sanitizeRecipeData(data.parsedRecipe);
      
      // Create the recipe data structure
      const recipeData = { 
        title: sanitizedRecipe.title || "Recipe from Image",
        description: sanitizedRecipe.description || "",
        ingredients: data.parsedRecipe.ingredients || sanitizedRecipe.ingredients || [],
        instructions: data.parsedRecipe.instructions || sanitizedRecipe.instructions || [],
        prep_time: data.parsedRecipe.prepTime || sanitizedRecipe.prep_time || 15,
        cook_time: data.parsedRecipe.cookTime || sanitizedRecipe.cook_time || 30,
        servings: data.parsedRecipe.servings || sanitizedRecipe.servings || 4,
        // Apply AI classification
        meal_type: data.parsedRecipe.mealType || undefined,
        cuisine_region: data.parsedRecipe.cuisineRegion || undefined,
        diet_lifestyle: data.parsedRecipe.dietLifestyle || [],
        // complexity_level removed
        top_tip: data.parsedRecipe.topTip || "Enjoy cooking this delicious recipe!",
        image: undefined, // Image will be uploaded separately via uploadRecipeImage
        imageFile: file, // Pass the original file for upload
        is_favorite: false,
        has_cooked: false,
        household_id: '',
      };

      setImportProgress("Complete!");
      setProgressValue(100);
      
      toast({
        title: "Image Processed! 📷",
        description: `Successfully extracted "${recipeData.title}" from the image.`,
      });

      return recipeData;
      
    } catch (error) {
      console.error('Error processing recipe image:', error);
      
      let errorMessage = "Failed to process recipe image. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('network')) {
          errorMessage = "Connection timeout. Please check your internet and try again.";
        } else if (error.message.includes('rate limit')) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (error.message.includes('file size')) {
          errorMessage = "Image file is too large. Please try a smaller image.";
        }
      }
      
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsProcessing(false);
      // Reset progress after delay
      setTimeout(() => {
        setImportProgress("");
        setProgressValue(0);
      }, 2000);
    }
  };

  return {
    isProcessing,
    importProgress,
    progressValue,
    processImage,
  };
}
