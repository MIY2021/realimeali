
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { useProgressTracking } from "./useUrlRecipeProcessing/useProgressTracking";
import { useImageHandling } from "./useUrlRecipeProcessing/useImageHandling";
import { handleProcessingError } from "./useUrlRecipeProcessing/errorHandling";
import { SUPPORTED_DOMAINS } from "./useUrlRecipeProcessing/constants";

export const useUrlRecipeProcessing = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    progress,
    currentStep,
    setProgress,
    setCurrentStep,
    resetProgress
  } = useProgressTracking();

  const {
    selectedImages,
    setSelectedImages,
    resetImages
  } = useImageHandling();

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

    // Validate domain
    const domain = new URL(url).hostname.replace('www.', '');
    if (!SUPPORTED_DOMAINS.includes(domain)) {
      toast({
        title: "Unsupported Website",
        description: `Sorry, we don't support recipes from ${domain} yet. Supported sites include: ${SUPPORTED_DOMAINS.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    resetProgress();
    
    try {
      setCurrentStep("Fetching recipe...");
      setProgress(20);

      console.log('🔗 Processing URL:', url);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { url: url.trim() },
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to parse recipe');
      }

      setProgress(60);
      setCurrentStep("Processing recipe data...");

      const recipeData = data.recipe;
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

      setProgress(80);
      setCurrentStep("Setting up recipe...");

      // Store images for selection if available
      if (data.images && data.images.length > 0) {
        console.log('🖼️ Found images:', data.images.length);
        setSelectedImages(data.images);
      }

      setProgress(100);
      setCurrentStep("Complete!");

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
      handleProcessingError(error, toast);
    } finally {
      setIsProcessing(false);
      setTimeout(resetProgress, 2000);
    }
  };

  const reset = () => {
    setUrl("");
    setIsProcessing(false);
    resetProgress();
    resetImages();
  };

  return {
    url,
    setUrl,
    isProcessing,
    progress,
    currentStep,
    selectedImages,
    setSelectedImages,
    handleImportFromUrl,
    reset,
  };
};
