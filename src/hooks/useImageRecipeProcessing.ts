
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { normalizeCuisineRegion } from "@/utils/recipeClassification";

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
    setProgressValue(0);

    try {
      // Gradually increase progress while reading the file (0% to 15%)
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 0.5;
        if (currentProgress >= 15) {
          clearInterval(progressInterval);
          setProgressValue(15);
        } else {
          setProgressValue(Math.floor(currentProgress));
        }
      }, 30); // Update every 30ms for smooth animation

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          clearInterval(progressInterval);
          const result = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => {
          clearInterval(progressInterval);
          reject(reader.error);
        };
        reader.readAsDataURL(file);
      });

      setProgressValue(20);
      setImportProgress("Processing image with AI...");

      // Gradually increase progress during AI processing (20% to 70%)
      let aiProgress = 20;
      const aiProgressInterval = setInterval(() => {
        aiProgress += 0.8;
        if (aiProgress >= 70) {
          clearInterval(aiProgressInterval);
          setProgressValue(70);
        } else {
          setProgressValue(Math.floor(aiProgress));
        }
      }, 80); // Update every 80ms

      console.log('Processing image with AI...');
      
      // Get the MIME type from the file
      const mimeType = file.type || 'image/jpeg';
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          image: base64,  // Changed from imageData to image
          mimeType: mimeType  // Added mimeType parameter
        }
      });

      clearInterval(aiProgressInterval);

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to process recipe image');
      }

      setProgressValue(75);
      setImportProgress("Extracting recipe data...");

      // Handle the response format - image processing returns { recipe: ... } not { parsedRecipe: ... }
      const parsedRecipe = data?.recipe || data?.parsedRecipe;
      
      if (!parsedRecipe) {
        throw new Error('No recipe data could be extracted from this image');
      }

      console.log('Received processed recipe from image:', parsedRecipe);
      
      setProgressValue(85);
      setImportProgress("Finalizing recipe...");

      // Transform the data to match our Recipe interface (same as URL import)
      const transformedRecipe = {
        title: parsedRecipe.title || "Recipe from Image",
        description: parsedRecipe.description || "",
        ingredients: Array.isArray(parsedRecipe.ingredients) ? parsedRecipe.ingredients : [],
        ingredient_group_indices: Array.isArray(parsedRecipe.ingredientGroupIndices) ? parsedRecipe.ingredientGroupIndices : undefined,
        instructions: Array.isArray(parsedRecipe.instructions) ? parsedRecipe.instructions : [],
        prep_time: parsedRecipe.prepTime || 0,
        cook_time: parsedRecipe.cookTime || 0,
        servings: parsedRecipe.servings || 1,
        top_tip: parsedRecipe.topTip || "",
        alcoholic_pairing: parsedRecipe.alcoholicPairing || null,
        non_alcoholic_pairing: parsedRecipe.nonAlcoholicPairing || null,
        // Convert mealType (string) to meal_types (array)
        meal_types: parsedRecipe.mealType ? [parsedRecipe.mealType] : [],
        // Don't auto-select cuisine - let user confirm/reject via autotag buttons
        cuisine_region: undefined,
        diet_lifestyle: Array.isArray(parsedRecipe.dietLifestyle) ? parsedRecipe.dietLifestyle : [],
        // Store suggested tags for confirmation (support multiple cuisines)
        suggestedTags: {
          meal_types: parsedRecipe.mealType ? [parsedRecipe.mealType] : [],
          cuisine_region: (() => {
            const cuisine = parsedRecipe.cuisineRegion;
            if (Array.isArray(cuisine)) {
              // Normalize all cuisine suggestions
              const normalized = cuisine.map(c => normalizeCuisineRegion(c)).filter(Boolean);
              console.log('✅ Storing cuisine suggestions (array):', normalized);
              return normalized;
            }
            if (cuisine) {
              // Normalize single cuisine suggestion
              const normalized = normalizeCuisineRegion(cuisine);
              if (normalized) {
                console.log('✅ Storing cuisine suggestion (single):', normalized, '(normalized from:', cuisine, ')');
                return [normalized];
              }
            }
            console.warn('⚠️ No cuisine suggestion from AI');
            return [];
          })(),
          diet_lifestyle: Array.isArray(parsedRecipe.dietLifestyle) ? parsedRecipe.dietLifestyle : [],
        },
        image: undefined, // Don't use the uploaded image - copyright concerns
        is_favorite: false,
        has_cooked: false,
        household_id: '',
      };

      // Gradually increase to 100%
      let finalProgress = 85;
      const finalProgressInterval = setInterval(() => {
        finalProgress += 2;
        if (finalProgress >= 100) {
          clearInterval(finalProgressInterval);
          setProgressValue(100);
          setImportProgress("Complete!");
        } else {
          setProgressValue(Math.floor(finalProgress));
        }
      }, 60); // Update every 60ms
      
      // Wait for progress to reach 100%
      await new Promise(resolve => setTimeout(resolve, 1000));
      clearInterval(finalProgressInterval);
      setProgressValue(100);
      setImportProgress("Complete!");
      
      toast({
        title: "Image Processed! 📷",
        description: `Successfully extracted "${transformedRecipe.title}" from the image.`,
      });

      return transformedRecipe;
      
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
