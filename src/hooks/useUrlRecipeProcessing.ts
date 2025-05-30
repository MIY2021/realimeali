
import { useState } from "react";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { validateInput, urlSchema } from "@/utils/inputValidation";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";
import { useImageHandling } from "./useUrlRecipeProcessing/useImageHandling";
import { useProgressTracking } from "./useUrlRecipeProcessing/useProgressTracking";
import { useErrorHandling } from "./useUrlRecipeProcessing/errorHandling";

export function useUrlRecipeProcessing() {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCommunityDialog, setShowCommunityDialog] = useState(false);
  const [parsedRecipeData, setParsedRecipeData] = useState<any>(null);

  const imageHandling = useImageHandling();
  const progressTracking = useProgressTracking();
  const { handleApiError, handleGeneralError } = useErrorHandling();

  const handleImportFromUrl = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void,
    downloadImages = false
  ) => {
    // Validate URL
    const validation = validateInput(urlSchema, recipeUrl.trim());
    if (!validation.success) {
      return;
    }

    setIsProcessing(true);
    imageHandling.resetImageState();
    
    const progressInterval = progressTracking.startProgressAnimation();
    
    try {
      console.log('Importing recipe from URL:', validation.data);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          websiteUrl: validation.data,
          extractImages: true,
          downloadImages: downloadImages
        }
      });

      progressTracking.completeProgress();

      if (error) {
        handleApiError(error, error.message);
        return;
      }

      if (!data?.parsedRecipe) {
        return;
      }

      console.log('Received imported recipe:', data.parsedRecipe);
      
      // Sanitize the recipe data - preserve all content faithfully
      const sanitizedRecipe = sanitizeRecipeData(data.parsedRecipe);
      
      // Apply AI categorization but preserve original content with proper field mapping
      const recipeData = { 
        ...currentRecipe, 
        ...sanitizedRecipe,
        // Preserve original ingredients and instructions without truncation
        ingredients: data.parsedRecipe.ingredients || sanitizedRecipe.ingredients,
        instructions: data.parsedRecipe.instructions || sanitizedRecipe.instructions,
        description: data.parsedRecipe.description || sanitizedRecipe.description,
        // Fix field mapping for times - ensure they're properly mapped from AI response
        prep_time: data.parsedRecipe.prepTime || data.parsedRecipe.prep_time || 15,
        cook_time: data.parsedRecipe.cookTime || data.parsedRecipe.cook_time || 30,
        servings: data.parsedRecipe.servings || 4,
        // Apply AI classification with fallbacks to ensure categories are selected
        meal_type: data.parsedRecipe.mealType || "dinner",
        cuisine_region: data.parsedRecipe.cuisineRegion || "british", 
        cooking_method: data.parsedRecipe.cookingMethod || "oven_baked",
        diet_lifestyle: data.parsedRecipe.dietLifestyle || [],
        complexity_level: data.parsedRecipe.complexityLevel || "standard",
        main_ingredient: data.parsedRecipe.mainIngredient || "mixed",
        top_tip: data.parsedRecipe.topTip || "Enjoy cooking this delicious recipe!"
      };
      
      // Handle images - show selection if multiple images found
      if (data.websiteImages && data.websiteImages.length > 0) {
        imageHandling.setWebsiteImages(data.websiteImages);
        imageHandling.setShowImageSelection(true);
        
        // Set first image as default selection
        const defaultImage = data.storedImages && data.storedImages.length > 0 
          ? data.storedImages[0].storedUrl 
          : data.websiteImages[0];
        imageHandling.setSelectedImage(defaultImage);
        recipeData.image = defaultImage;
      }

      if (data.storedImages && data.storedImages.length > 0) {
        imageHandling.setStoredImages(data.storedImages);
      }
      
      // Store parsed data for potential community submission
      setParsedRecipeData({
        title: recipeData.title,
        description: recipeData.description,
        source_url: validation.data,
        image_url: recipeData.image,
        prep_time: recipeData.prep_time || 0,
        cook_time: recipeData.cook_time || 0,
        servings: recipeData.servings || 1,
      });
      
      setNewRecipe(recipeData);
      setActiveTab("manual");
    } catch (error) {
      handleGeneralError(error);
    } finally {
      clearInterval(progressInterval);
      progressTracking.resetProgress();
      setIsProcessing(false);
    }
  };

  const handleDownloadImages = () => imageHandling.handleDownloadImages(recipeUrl);

  return {
    recipeUrl,
    setRecipeUrl,
    isProcessing,
    showCommunityDialog,
    setShowCommunityDialog,
    parsedRecipeData,
    handleImportFromUrl,
    handleDownloadImages,
    // Export all image handling functionality
    ...imageHandling,
    // Export all progress tracking functionality
    ...progressTracking,
  };
}
