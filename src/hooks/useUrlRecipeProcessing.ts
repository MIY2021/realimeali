
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

    // Remove domain validation - let the edge function handle parsing attempts
    try {
      new URL(url.trim()); // Just validate it's a valid URL format
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    progressTracking.resetProgress();
    
    try {
      progressTracking.setCurrentStep("Fetching recipe...");
      progressTracking.setProgress(20);

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

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to parse recipe from this website. The site may not contain recipe data or may be blocking automated access.');
      }

      progressTracking.setProgress(60);
      progressTracking.setCurrentStep("Processing recipe data...");

      const recipeData = data.parsedRecipe;
      console.log('📄 Parsed recipe data:', recipeData);

      // Transform the data to match our Recipe interface
      const transformedRecipe = {
        ...newRecipe,
        title: recipeData.title || "",
        description: recipeData.description || "",
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        prep_time: recipeData.prep_time || 0,
        cook_time: recipeData.cook_time || 0,
        servings: recipeData.servings || 1,
        image: recipeData.image || "",
        top_tip: recipeData.top_tip || "",
        // Preserve any existing household_id and other fields
        household_id: newRecipe.household_id,
        is_favorite: newRecipe.is_favorite,
        has_cooked: newRecipe.has_cooked,
        meal_type: newRecipe.meal_type,
        cuisine_region: newRecipe.cuisine_region,
        diet_lifestyle: newRecipe.diet_lifestyle || [],
        complexity_level: newRecipe.complexity_level,
        main_ingredient: newRecipe.main_ingredient,
      };

      progressTracking.setProgress(80);
      progressTracking.setCurrentStep("Setting up recipe...");

      // Store images for selection if available
      if (data.images && data.images.length > 0) {
        console.log('🖼️ Found images from website:', data.images.length);
        imageHandling.setWebsiteImages(data.images);
      }

      progressTracking.setProgress(100);
      progressTracking.setCurrentStep("Complete!");

      const domain = new URL(url).hostname.replace('www.', '');
      console.log('✅ Recipe imported successfully');
      setNewRecipe(transformedRecipe);
      
      // Set community sharing to checked by default for imported recipes
      if (setShareWithCommunity) {
        setShareWithCommunity(true);
        console.log('🌍 Community sharing enabled by default for imported recipe');
      }
      
      setActiveTab("manual");
      
      toast({
        title: "Recipe imported!",
        description: `Successfully imported "${transformedRecipe.title}" from ${domain}. Community sharing enabled by default.`,
      });

      // Reset the URL input
      setUrl("");
      
    } catch (error) {
      console.error('Error importing recipe:', error);
      
      // Provide more helpful error messages based on the error type
      let errorMessage = "Failed to import recipe from this website.";
      let errorDescription = "Please try a different recipe URL or enter the recipe manually.";
      
      if (error.message?.includes('Failed to fetch website')) {
        errorDescription = "The website may be blocking automated access. Try copying the recipe text instead.";
      } else if (error.message?.includes('not contain recipe data')) {
        errorDescription = "This page doesn't appear to contain a recipe. Make sure you're on a recipe page.";
      } else if (error.message?.includes('timeout')) {
        errorDescription = "The website took too long to respond. Please try again.";
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(progressTracking.resetProgress, 2000);
    }
  };

  const reset = () => {
    setUrl("");
    setIsProcessing(false);
    progressTracking.resetProgress();
    imageHandling.resetImages();
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
    searchedImages: imageHandling.searchedImages,
    storedImages: imageHandling.storedImages,
    isDownloadingImages: imageHandling.isDownloadingImages,
    isSearchingImages: imageHandling.isSearchingImages,
    showImageSelection: imageHandling.showImageSelection,
    selectedImage: imageHandling.selectedImage,
    handleImageSelect: imageHandling.handleImageSelect,
    handleDownloadImages: imageHandling.handleDownloadImages,
    searchRecipeImages: imageHandling.searchRecipeImages,
    
    // Dialog state
    showCommunityDialog,
    setShowCommunityDialog,
    parsedRecipeData,
    
    // Main functions
    handleImportFromUrl,
    reset,
  };
};
