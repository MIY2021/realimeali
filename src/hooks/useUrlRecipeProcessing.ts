import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { validateInput, urlSchema } from "@/utils/inputValidation";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";

interface StoredImage {
  originalUrl: string;
  storedUrl: string;
  filename: string;
}

export function useUrlRecipeProcessing() {
  const { toast } = useToast();
  const [recipeUrl, setRecipeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [websiteImages, setWebsiteImages] = useState<string[]>([]);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [isDownloadingImages, setIsDownloadingImages] = useState(false);
  const [showCommunityDialog, setShowCommunityDialog] = useState(false);
  const [parsedRecipeData, setParsedRecipeData] = useState<any>(null);
  const [importProgress, setImportProgress] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const funnyMessages = [
    "🤓 Oh where did I put my reading glasses...",
    "😋 WOW this recipe looks tasty!",
    "🤤 Getting hungry just looking at this...",
    "🕵️ Investigating kitchen mysteries...",
    "🎭 Putting on my chef hat...",
    "🦸 Activating recipe superpowers...",
    "🔮 Consulting the culinary crystal ball...",
    "🎪 Performing food magic tricks...",
    "🧙‍♂️ Brewing up some recipe wizardry...",
    "🎯 Hunting for flavor treasures..."
  ];

  const handleImportFromUrl = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    setActiveTab: (tab: string) => void,
    downloadImages = false
  ) => {
    // Validate URL
    const validation = validateInput(urlSchema, recipeUrl.trim());
    if (!validation.success) {
      toast({
        title: "Invalid URL",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setWebsiteImages([]);
    setStoredImages([]);
    setShowImageSelection(false);
    setProgressValue(0);
    
    // Enhanced progress simulation
    let messageIndex = 0;
    let currentProgress = 0;
    
    const progressInterval = setInterval(() => {
      // Update progress smoothly
      currentProgress = Math.min(currentProgress + Math.random() * 15 + 5, 85);
      setProgressValue(currentProgress);
      
      // Update funny messages
      if (messageIndex < funnyMessages.length) {
        setImportProgress(funnyMessages[messageIndex]);
        messageIndex++;
      }
    }, 800);
    
    try {
      console.log('Importing recipe from URL:', validation.data);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          websiteUrl: validation.data,
          extractImages: true,
          downloadImages: downloadImages
        }
      });

      // Complete progress animation quickly at the end
      setProgressValue(100);
      setImportProgress("✨ Recipe imported successfully!");

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        
        // Handle specific error codes with more robust error checking
        const errorMessage = error.message || 'Unknown error occurred';
        
        if (errorMessage.includes('Resource unavailable') || errorMessage.includes('busy')) {
          toast({
            title: "AI Service Busy",
            description: "The AI service is temporarily busy. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          toast({
            title: "Import Timeout",
            description: "Website took too long to process. Please try again.",
            variant: "destructive",
          });
        } else if (errorMessage.includes('Could not extract content') || errorMessage.includes('Failed to fetch')) {
          toast({
            title: "Website Access Error",
            description: "Could not access the website content. Please check the URL or try a different recipe website.",
            variant: "destructive",
          });
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Import Failed",
            description: `Failed to import from website: ${errorMessage}. Please try again or use a different URL.`,
            variant: "destructive",
          });
        }
        return;
      }

      if (!data?.parsedRecipe) {
        toast({
          title: "No Recipe Found",
          description: "Could not find recipe data on this website. Try a different recipe URL.",
          variant: "destructive",
        });
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
        setWebsiteImages(data.websiteImages);
        setShowImageSelection(true);
        
        // Set first image as default selection
        const defaultImage = data.storedImages && data.storedImages.length > 0 
          ? data.storedImages[0].storedUrl 
          : data.websiteImages[0];
        setSelectedImage(defaultImage);
        recipeData.image = defaultImage;
      }

      if (data.storedImages && data.storedImages.length > 0) {
        setStoredImages(data.storedImages);
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
      
      const imageMessage = downloadImages && data.storedImages?.length > 0 
        ? ` ${data.storedImages.length} images downloaded and stored.`
        : data.websiteImages?.length > 0 
        ? ` ${data.websiteImages.length} images found for selection.`
        : '';
      
      toast({
        title: "Recipe Imported! 🎉",
        description: `Recipe details extracted and auto-categorized successfully.${imageMessage}`,
      });
    } catch (error) {
      console.error('Error importing from website:', error);
      toast({
        title: "Import Error",
        description: "An unexpected error occurred. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setImportProgress("");
        setProgressValue(0);
      }, 2000);
      setIsProcessing(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleDownloadImages = async () => {
    if (websiteImages.length === 0 || !recipeUrl.trim()) {
      toast({
        title: "Error",
        description: "No images available to download",
        variant: "destructive",
      });
      return;
    }

    setIsDownloadingImages(true);
    try {
      console.log('Downloading images from website...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          websiteUrl: recipeUrl.trim(),
          extractImages: true,
          downloadImages: true
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to download images');
      }

      if (data.storedImages && data.storedImages.length > 0) {
        setStoredImages(data.storedImages);
        toast({
          title: "Images Downloaded",
          description: `${data.storedImages.length} images saved successfully`,
        });
      } else {
        toast({
          title: "No Images Downloaded",
          description: "Unable to download images from this website",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error downloading images:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingImages(false);
    }
  };

  return {
    recipeUrl,
    setRecipeUrl,
    isProcessing,
    websiteImages,
    storedImages,
    isDownloadingImages,
    showCommunityDialog,
    setShowCommunityDialog,
    parsedRecipeData,
    importProgress,
    progressValue,
    showImageSelection,
    selectedImage,
    handleImportFromUrl,
    handleDownloadImages,
    handleImageSelect,
  };
}
