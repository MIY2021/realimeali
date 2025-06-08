
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { useProgressTracking } from "./useUrlRecipeProcessing/useProgressTracking";
import { useImageHandling } from "./useUrlRecipeProcessing/useImageHandling";
import { handleProcessingError } from "./useUrlRecipeProcessing/errorHandling";

export const useUrlRecipeProcessing = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCommunityDialog, setShowCommunityDialog] = useState(false);
  const [parsedRecipeData, setParsedRecipeData] = useState(null);
  
  const progressTracking = useProgressTracking();
  const imageHandling = useImageHandling();

  const handleImportFromUrl = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void,
    setShareWithCommunity?: (share: boolean) => void
  ) => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation - just check if it's a valid URL format
    try {
      new URL(url.trim());
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Immediately reset progress to avoid flickering
    progressTracking.resetProgress(true);
    
    // Start the funny loading animation
    const progressInterval = progressTracking.startProgressAnimation();
    
    try {
      console.log('🔗 Processing URL:', url);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          websiteUrl: url.trim(),
          extractImages: true
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data could be extracted from this website. This might happen if:\n• The page doesn\'t contain a recipe\n• The website blocks automated access\n• The recipe format isn\'t recognized\n\nTry copying the recipe text and using the "Paste Recipe Text" tab instead.');
      }

      // Clear the progress animation and complete
      clearInterval(progressInterval);
      progressTracking.completeProgress();

      const recipeData = data.parsedRecipe;
      console.log('📄 Parsed recipe data:', recipeData);

      // Transform the data to match our Recipe interface
      const transformedRecipe = {
        ...newRecipe,
        title: recipeData.title || "",
        description: recipeData.description || "",
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        prep_time: recipeData.prepTime || 0,
        cook_time: recipeData.cookTime || 0,
        servings: recipeData.servings || 1,
        top_tip: recipeData.topTip || "",
        // Apply AI classification
        meal_type: recipeData.mealType || newRecipe.meal_type,
        cuisine_region: recipeData.cuisineRegion || newRecipe.cuisine_region,
        diet_lifestyle: recipeData.dietLifestyle || newRecipe.diet_lifestyle || [],
        complexity_level: recipeData.complexityLevel || newRecipe.complexity_level,
        main_ingredient: recipeData.mainIngredient || newRecipe.main_ingredient,
        // Preserve any existing household_id and other fields
        household_id: newRecipe.household_id,
        is_favorite: newRecipe.is_favorite,
        has_cooked: newRecipe.has_cooked,
        image: undefined, // Start with no image so user can select or upload
      };

      // Store images for selection if available
      if (data.websiteImages && data.websiteImages.length > 0) {
        console.log('🖼️ Found images:', data.websiteImages.length);
        imageHandling.setWebsiteImages(data.websiteImages);
        imageHandling.setShowImageSelection(true);
        
        // Auto-select the first image but don't force it into the recipe yet
        const firstImage = data.websiteImages[0];
        imageHandling.setSelectedImage(firstImage);
        console.log('🎯 Auto-selected first image:', firstImage);
      }

      console.log('✅ Recipe imported successfully');
      setNewRecipe(transformedRecipe);
      
      // Set community sharing to checked by default for imported recipes
      if (setShareWithCommunity) {
        setShareWithCommunity(true);
        console.log('🌍 Community sharing enabled by default for imported recipe');
      }
      
      setActiveTab("manual");
      
      const domain = new URL(url).hostname;
      toast({
        title: "Recipe imported!",
        description: `Successfully imported "${transformedRecipe.title}" from ${domain}. Community sharing enabled by default.`,
      });

      // Store parsed recipe data with original URL for potential community submission
      setParsedRecipeData({
        ...recipeData,
        source_url: url.trim(), // Preserve the original external URL
        image_url: undefined, // Don't set image until user selects one
        prep_time: transformedRecipe.prep_time,
        cook_time: transformedRecipe.cook_time,
        servings: transformedRecipe.servings,
      });

      // Reset the URL input
      setUrl("");
      
    } catch (error) {
      clearInterval(progressInterval);
      handleProcessingError(error, toast);
    } finally {
      setIsProcessing(false);
      // Use delayed reset for cleanup
      progressTracking.resetProgress();
    }
  };

  const reset = () => {
    setUrl("");
    setIsProcessing(false);
    progressTracking.resetProgress(true);
    imageHandling.resetImages();
    setParsedRecipeData(null);
  };

  return {
    // URL state
    url,
    setUrl,
    recipeUrl: url,
    setRecipeUrl: setUrl,
    
    // Processing state
    isProcessing,
    
    // Progress tracking
    progress: progressTracking.progress,
    currentStep: progressTracking.currentStep,
    importProgress: progressTracking.importProgress,
    progressValue: progressTracking.progressValue,
    
    // Image handling
    selectedImages: imageHandling.selectedImages,
    setSelectedImages: imageHandling.setSelectedImages,
    websiteImages: imageHandling.websiteImages,
    storedImages: imageHandling.storedImages,
    isDownloadingImages: imageHandling.isDownloadingImages,
    showImageSelection: imageHandling.showImageSelection,
    selectedImage: imageHandling.selectedImage,
    handleImageSelect: imageHandling.handleImageSelect,
    handleDownloadImages: imageHandling.handleDownloadImages,
    
    // Dialog state
    showCommunityDialog,
    setShowCommunityDialog,
    parsedRecipeData,
    
    // Main functions
    handleImportFromUrl,
    reset,
  };
};
