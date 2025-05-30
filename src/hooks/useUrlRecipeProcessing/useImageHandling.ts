
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
  const [websiteImages, setWebsiteImages] = useState<string[]>([]);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [isDownloadingImages, setIsDownloadingImages] = useState(false);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleImageSelect = (imageUrl: string) => {
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

  const resetImageState = () => {
    setWebsiteImages([]);
    setStoredImages([]);
    setShowImageSelection(false);
    setSelectedImage("");
  };

  return {
    websiteImages,
    setWebsiteImages,
    storedImages,
    setStoredImages,
    isDownloadingImages,
    showImageSelection,
    setShowImageSelection,
    selectedImage,
    setSelectedImage,
    handleImageSelect,
    handleDownloadImages,
    resetImageState,
  };
};
