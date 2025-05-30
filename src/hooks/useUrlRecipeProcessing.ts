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

  const funnyMessages = [
    "🕵️ Sneaking into the kitchen...",
    "🔍 Analyzing secret ingredients...",
    "🧠 Teaching AI what delicious looks like...",
    "📝 Copying the chef's homework...",
    "🎭 Pretending to be a food critic...",
    "🔬 Extracting flavor molecules...",
    "📸 Taking sneaky recipe photos...",
    "🎪 Performing culinary magic tricks...",
    "🦸 Unleashing recipe superpowers...",
    "🎯 Hunting down those instructions..."
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
    
    // Show funny progress messages
    let messageIndex = 0;
    const progressInterval = setInterval(() => {
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

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        
        // Handle specific error codes
        if (error.message?.includes('Resource unavailable')) {
          toast({
            title: "AI Service Busy",
            description: "The AI service is temporarily busy. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes('timeout')) {
          toast({
            title: "Import Timeout",
            description: "Website took too long to process. Please try again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Could not extract content')) {
          toast({
            title: "Website Access Error",
            description: "Could not access the website content. Please check the URL or try a different recipe website.",
            variant: "destructive",
          });
        } else if (error.message?.includes('rate limit')) {
          toast({
            title: "Rate Limit",
            description: "Too many requests. Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Import Failed",
            description: "Failed to import from website. Please try again or use a different URL.",
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
      
      // Sanitize the recipe data
      const sanitizedRecipe = sanitizeRecipeData(data.parsedRecipe);
      const recipeData = { ...currentRecipe, ...sanitizedRecipe };
      
      if (data.websiteImages && data.websiteImages.length > 0) {
        setWebsiteImages(data.websiteImages);
      }

      if (data.storedImages && data.storedImages.length > 0) {
        setStoredImages(data.storedImages);
        recipeData.image = data.storedImages[0].storedUrl;
      } else if (data.websiteImages && data.websiteImages.length > 0) {
        recipeData.image = data.websiteImages[0];
      }
      
      // Store parsed data for potential community submission
      setParsedRecipeData({
        title: recipeData.title,
        description: recipeData.description,
        source_url: validation.data,
        image_url: recipeData.image,
        prep_time: recipeData.prepTime || 0,
        cook_time: recipeData.cookTime || 0,
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
        description: `Recipe details extracted successfully.${imageMessage}`,
      });
    } catch (error) {
      console.error('Error importing from website:', error);
      toast({
        title: "Import Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setImportProgress("");
      setIsProcessing(false);
    }
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
    handleImportFromUrl,
    handleDownloadImages,
  };
}
