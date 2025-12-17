
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { useProgressTracking } from "./useUrlRecipeProcessing/useProgressTracking";
import { useImageHandling } from "./useUrlRecipeProcessing/useImageHandling";
import { handleProcessingError } from "./useUrlRecipeProcessing/errorHandling";

let debounceTimeout: NodeJS.Timeout | null = null;

export const useUrlRecipeProcessing = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCommunityDialog, setShowCommunityDialog] = useState(false);
  const [parsedRecipeData, setParsedRecipeData] = useState(null);
  
  const progressTracking = useProgressTracking();
  const imageHandling = useImageHandling();

  const handleImportFromUrl = useCallback(async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void
  ) => {
    // Clear any existing debounce
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url.trim());
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL (e.g., https://example.com/recipe)",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple simultaneous requests
    if (isProcessing) {
      console.log('⏳ Recipe import already in progress, ignoring duplicate request');
      return;
    }

    setIsProcessing(true);
    progressTracking.resetProgress(true);
    
    // Start progress animation
    const progressInterval = progressTracking.startProgressAnimation();
    
    try {
      console.log('🔗 Processing URL:', url.trim());
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          websiteUrl: url.trim(),
          extractImages: true
        },
      });

      // Clear progress interval
      clearInterval(progressInterval);

      if (error) {
        console.error('❌ Function error:', error);
        throw error;
      }

      if (!data?.parsedRecipe) {
        console.error('❌ No recipe data in response:', data);
        throw new Error('No recipe data could be extracted from this website. This might happen if:\n• The page doesn\'t contain a recipe\n• The website blocks automated access\n• The recipe format isn\'t recognized\n\nTry copying the recipe text and using the "Paste Recipe Text" tab instead.');
      }

      const recipeData = data.parsedRecipe;
      console.log('📄 Parsed recipe data:', recipeData.title);

      // Complete progress
      progressTracking.completeProgress();

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
        alcoholic_pairing: recipeData.alcoholicPairing || null,
        non_alcoholic_pairing: recipeData.nonAlcoholicPairing || null,
        meal_type: recipeData.mealType || newRecipe.meal_type,
        cuisine_region: recipeData.cuisineRegion || newRecipe.cuisine_region,
        diet_lifestyle: recipeData.dietLifestyle || newRecipe.diet_lifestyle || [],
        // complexity_level removed
        household_id: newRecipe.household_id,
        is_favorite: newRecipe.is_favorite,
        has_cooked: newRecipe.has_cooked,
        image: undefined, // Start with no image so user can select
      };

      // Store images for selection if available
      if (data.websiteImages && data.websiteImages.length > 0) {
        console.log('🖼️ Found images:', data.websiteImages.length);
        imageHandling.setWebsiteImages(data.websiteImages);
        imageHandling.setShowImageSelection(true);
        
      // Auto-select the first image and download it for later upload
      const firstImage = data.websiteImages[0];
      imageHandling.setSelectedImage(firstImage);

      // Download external image and prepare for upload during save
      try {
        console.log('📥 Downloading external image for later upload...');
        
        const imageResponse = await fetch(firstImage);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        const imageFile = new File([imageBlob], 'recipe-image.jpg', { type: 'image/jpeg' });
        
        // Store the external URL temporarily for display
        (transformedRecipe as any).image = firstImage;
        (transformedRecipe as any).image_thumbnail = undefined;
        
        // IMPORTANT: Return the imageFile so it can be stored and uploaded during save with correct IDs
        (transformedRecipe as any).downloadedImageFile = imageFile;
        
        console.log('✅ External image downloaded and ready for upload during save');
      } catch (error) {
        console.error('⚠️ Failed to download external image:', error);
        // Fall back to external URL
        (transformedRecipe as any).image = firstImage;
        (transformedRecipe as any).image_thumbnail = undefined;
      }
        console.log('🎯 Auto-selected first image:', firstImage);
      }

      console.log('✅ Recipe imported successfully:', transformedRecipe.title);
      setNewRecipe(transformedRecipe);
      
      setActiveTab("manual");
      
      const domain = new URL(url).hostname;
      toast({
        title: "Recipe imported!",
        description: `Successfully imported "${transformedRecipe.title}" from ${domain}`,
      });

      // Store parsed recipe data with original URL
      setParsedRecipeData({
        ...recipeData,
        source_url: url.trim(),
        image_url: transformedRecipe.image,
        prep_time: transformedRecipe.prep_time,
        cook_time: transformedRecipe.cook_time,
        servings: transformedRecipe.servings,
      });

      // Reset the URL input
      setUrl("");
      
    } catch (error) {
      console.error('❌ Error importing recipe:', error);
      clearInterval(progressInterval);
      handleProcessingError(error, toast);
    } finally {
      setIsProcessing(false);
      // Reset progress after delay
      setTimeout(() => {
        progressTracking.resetProgress();
      }, 2000);
    }
  }, [url, isProcessing, toast, progressTracking, imageHandling]);

  const reset = useCallback(() => {
    setUrl("");
    setIsProcessing(false);
    progressTracking.resetProgress(true);
    imageHandling.resetImages();
    setParsedRecipeData(null);
  }, [progressTracking, imageHandling]);

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
    handleDownloadImages: (url: string) => imageHandling.handleDownloadImages(url),
    
    // Dialog state
    showCommunityDialog,
    setShowCommunityDialog,
    parsedRecipeData,
    
    // Main functions
    handleImportFromUrl,
    reset,
  };
};
