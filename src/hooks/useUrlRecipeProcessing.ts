
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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

  const handleImportFromUrl = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void,
    downloadImages = false
  ) => {
    if (!recipeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setWebsiteImages([]);
    setStoredImages([]);
    
    try {
      console.log('Importing recipe from URL:', recipeUrl);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          websiteUrl: recipeUrl.trim(),
          extractImages: true,
          downloadImages: downloadImages
        }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to import from website');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data received from website');
      }

      console.log('Received imported recipe:', data.parsedRecipe);
      
      const recipeData = { ...currentRecipe, ...data.parsedRecipe };
      
      if (data.websiteImages && data.websiteImages.length > 0) {
        setWebsiteImages(data.websiteImages);
      }

      if (data.storedImages && data.storedImages.length > 0) {
        setStoredImages(data.storedImages);
        recipeData.image = data.storedImages[0].storedUrl;
      } else if (data.websiteImages && data.websiteImages.length > 0) {
        recipeData.image = data.websiteImages[0];
      }
      
      setNewRecipe(recipeData);
      setActiveTab("manual");
      
      const imageMessage = downloadImages && data.storedImages?.length > 0 
        ? ` ${data.storedImages.length} images downloaded and stored.`
        : data.websiteImages?.length > 0 
        ? ` ${data.websiteImages.length} images found for selection.`
        : '';
      
      toast({
        title: "Recipe Imported!",
        description: `Recipe details extracted successfully.${imageMessage}`,
      });
    } catch (error) {
      console.error('Error importing from website:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to import from website. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
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
        description: error.message || "Failed to download images",
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
    handleImportFromUrl,
    handleDownloadImages,
  };
}
