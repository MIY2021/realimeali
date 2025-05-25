
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useImageRecipeProcessing() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessImage = async (
    file: File,
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    setActiveTab: (tab: string) => void
  ) => {
    setIsProcessing(true);
    try {
      console.log('Processing image file:', file.name, file.type);
      
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

  return {
    isProcessing,
    handleProcessImage,
  };
}
