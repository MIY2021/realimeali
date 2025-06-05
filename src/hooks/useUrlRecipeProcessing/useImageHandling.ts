import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoredImage {
  originalUrl: string;
  storedUrl: string;
  filename: string;
}

export const useImageHandling = () => {
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [websiteImages, setWebsiteImages] = useState<string[]>([]);
  const [searchedImages, setSearchedImages] = useState<string[]>([]);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [isDownloadingImages, setIsDownloadingImages] = useState(false);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleImageSelect = (imageUrl: string) => {
    console.log('Image selected:', imageUrl);
    setSelectedImage(imageUrl);
  };

  const searchRecipeImages = async (recipeTitle: string) => {
    if (!recipeTitle.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required to search for images",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingImages(true);
    
    try {
      console.log('🔍 Searching for images for recipe:', recipeTitle);
      
      const { data, error } = await supabase.functions.invoke('search-recipe-images', {
        body: { recipeTitle: recipeTitle.trim() }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to search for images');
      }

      const images = data.images || [];
      setSearchedImages(images);
      
      // Merge with existing website images
      const allImages = [...websiteImages, ...images];
      setWebsiteImages(allImages);

      if (images.length === 0) {
        toast({
          title: "No Images Found",
          description: "Try adding more descriptive words to your recipe title",
        });
      } else {
        toast({
          title: "Images Found!",
          description: `Found ${images.length} images for "${recipeTitle}"`,
        });
      }

      console.log('✅ Found images:', images);
      return images;

    } catch (error) {
      console.error('❌ Error searching for images:', error);
      
      if (error.message?.includes('Google API credentials not configured')) {
        toast({
          title: "Image Search Unavailable",
          description: "Google API credentials need to be configured",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Search Failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
      
      return [];
    } finally {
      setIsSearchingImages(false);
    }
  };

  const handleDownloadImages = async (recipeUrl: string) => {
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

  const resetImages = () => {
    console.log('Resetting image state');
    setSelectedImages([]);
    setWebsiteImages([]);
    setSearchedImages([]);
    setStoredImages([]);
    setShowImageSelection(false);
    setSelectedImage("");
  };

  // Add debug logging when state changes
  const setWebsiteImagesWithLogging = (images: string[]) => {
    console.log('Setting website images:', images);
    setWebsiteImages(images);
  };

  const setStoredImagesWithLogging = (images: StoredImage[]) => {
    console.log('Setting stored images:', images);
    setStoredImages(images);
  };

  return {
    selectedImages,
    setSelectedImages,
    resetImages,
    websiteImages,
    setWebsiteImages: setWebsiteImagesWithLogging,
    searchedImages,
    storedImages,
    setStoredImages: setStoredImagesWithLogging,
    isDownloadingImages,
    isSearchingImages,
    showImageSelection,
    setShowImageSelection,
    selectedImage,
    setSelectedImage,
    handleImageSelect,
    handleDownloadImages,
    searchRecipeImages,
  };
};
