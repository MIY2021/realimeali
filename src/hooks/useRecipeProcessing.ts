import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe, RecipeCategory } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface StoredImage {
  originalUrl: string;
  storedUrl: string;
  filename: string;
}

export function useRecipeProcessing() {
  const { toast } = useToast();
  const [recipeText, setRecipeText] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [websiteImages, setWebsiteImages] = useState<string[]>([]);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [isDownloadingImages, setIsDownloadingImages] = useState(false);

  const handleProcessText = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void
  ) => {
    if (!recipeText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some recipe text first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Processing recipe text:', recipeText.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { recipeText: recipeText.trim() }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to process recipe text');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data received from AI');
      }

      console.log('Received parsed recipe:', data.parsedRecipe);
      
      setNewRecipe({ ...currentRecipe, ...data.parsedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Extracted!",
        description: "Review and edit your recipe in the Manual Entry tab",
      });
    } catch (error) {
      console.error('Error processing recipe text:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process recipe text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
      
      // Store website images for selection
      if (data.websiteImages && data.websiteImages.length > 0) {
        setWebsiteImages(data.websiteImages);
      }

      // Store downloaded images if available
      if (data.storedImages && data.storedImages.length > 0) {
        setStoredImages(data.storedImages);
        // Use the first stored image as default
        recipeData.image = data.storedImages[0].storedUrl;
      } else if (data.websiteImages && data.websiteImages.length > 0) {
        // Fallback to first website image if no stored images
        recipeData.image = data.websiteImages[0];
      }
      
      setNewRecipe(recipeData);
      
      // Auto-switch to manual tab like other import methods
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

  const handleProcessImage = async (
    file: File,
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void
  ) => {
    setIsProcessing(true);
    try {
      console.log('Processing image file:', file.name, file.type);
      
      // Convert image to base64
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('Image converted to base64, calling AI...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { imageUrl: imageDataUrl }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to extract recipe from image');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data could be extracted from the image');
      }

      console.log('Received recipe from image:', data.parsedRecipe);
      
      setNewRecipe({ ...currentRecipe, ...data.parsedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Extracted!",
        description: "Review your recipe extracted from the photo",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to extract recipe from image. Please try with a clearer image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateRecipe = async (
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void
  ) => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what kind of recipe you want",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Generating recipe with AI prompt:', aiPrompt);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { recipeText: `Generate a complete recipe based on this request: ${aiPrompt.trim()}` }
      });

      if (error) {
        console.error('Error calling parse-recipe-ai function:', error);
        throw new Error(error.message || 'Failed to generate recipe');
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe was generated from your request');
      }

      console.log('Received generated recipe:', data.parsedRecipe);
      
      setNewRecipe({ ...currentRecipe, ...data.parsedRecipe });
      setActiveTab("manual");
      
      toast({
        title: "Recipe Generated!",
        description: "Your AI-generated recipe is ready for review",
      });
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recipe. Please try again with a different prompt.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    recipeText,
    setRecipeText,
    recipeUrl,
    setRecipeUrl,
    aiPrompt,
    setAiPrompt,
    isProcessing,
    websiteImages,
    storedImages,
    isDownloadingImages,
    handleProcessText,
    handleImportFromUrl,
    handleProcessImage,
    handleGenerateRecipe,
    handleDownloadImages,
  };
}
