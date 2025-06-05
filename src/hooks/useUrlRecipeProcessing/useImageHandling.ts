
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
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [isDownloadingImages, setIsDownloadingImages] = useState(false);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleImageSelect = (imageUrl: string) => {
    console.log('🖼️ Image selected:', imageUrl);
    setSelectedImage(imageUrl);
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
      console.log('📥 Downloading images from website...');
      
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
      console.error('❌ Error downloading images:', error);
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
    console.log('🔄 Resetting image state');
    setSelectedImages([]);
    setWebsiteImages([]);
    setStoredImages([]);
    setShowImageSelection(false);
    setSelectedImage("");
  };

  // Add debug logging when state changes
  const setWebsiteImagesWithLogging = (images: string[]) => {
    console.log('📋 Setting website images:', images);
    setWebsiteImages(images);
  };

  const setStoredImagesWithLogging = (images: StoredImage[]) => {
    console.log('💾 Setting stored images:', images);
    setStoredImages(images);
  };

  const setSelectedImageWithLogging = (imageUrl: string) => {
    console.log('🎯 Setting selected image:', imageUrl);
    setSelectedImage(imageUrl);
  };

  return {
    selectedImages,
    setSelectedImages,
    resetImages,
    websiteImages,
    setWebsiteImages: setWebsiteImagesWithLogging,
    storedImages,
    setStoredImages: setStoredImagesWithLogging,
    isDownloadingImages,
    showImageSelection,
    setShowImageSelection,
    selectedImage,
    setSelectedImage: setSelectedImageWithLogging,
    handleImageSelect,
    handleDownloadImages,
  };
};
