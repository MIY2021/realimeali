
import { useState } from "react";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { validateInput, urlSchema } from "@/utils/inputValidation";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";
import { useImageHandling } from "./useUrlRecipeProcessing/useImageHandling";
import { useProgressTracking } from "./useUrlRecipeProcessing/useProgressTracking";
import { useErrorHandling } from "./useUrlRecipeProcessing/errorHandling";
import { useToast } from "./use-toast";

export function useUrlRecipeProcessing() {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCommunityDialog, setShowCommunityDialog] = useState(false);
  const [parsedRecipeData, setParsedRecipeData] = useState<any>(null);
  const { toast } = useToast();

  const imageHandling = useImageHandling();
  const progressTracking = useProgressTracking();
  const { handleApiError, handleGeneralError } = useErrorHandling();

  const handleImportFromUrl = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void,
    downloadImages = true // Changed default to true to always attempt image download
  ) => {
    // Validate URL
    const validation = validateInput(urlSchema, recipeUrl.trim());
    if (!validation.success) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
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
        toast({
          title: "Error",
          description: "No recipe found at that URL",
          variant: "destructive",
        });
        return;
      }

      console.log('Received imported recipe:', data);
      
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
        top_tip: data.parsedRecipe.topTip || "Enjoy cooking this delicious recipe!",
        // Set flags to enable community sharing
        wasImportedFromWebsite: true,
      };
      
      // Handle images - always process images if found
      if (data.websiteImages && data.websiteImages.length > 0) {
        console.log('Website images found:', data.websiteImages);
        imageHandling.setWebsiteImages(data.websiteImages);
        
        // Set first image as default selection
        const defaultImage = data.storedImages && data.storedImages.length > 0 
          ? data.storedImages[0].storedUrl 
          : data.websiteImages[0];
        imageHandling.setSelectedImage(defaultImage);
        recipeData.image = defaultImage;
      }

      if (data.storedImages && data.storedImages.length > 0) {
        console.log('Stored images found:', data.storedImages);
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
      
      // Always show the community dialog after successful import
      setShowCommunityDialog(true);
      
      // Navigate to manual tab to review the recipe
      setActiveTab("manual");
      
      toast({
        title: "Recipe Imported! 🎉",
        description: "Recipe imported successfully. Review and save when ready.",
      });
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
