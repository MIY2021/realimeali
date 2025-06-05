
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types";

export function useRecipeImageHandling() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    handleImageSelect: (url: string) => void,
    setRecipeUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      setNewRecipe({ ...currentRecipe, image: "" });
      return;
    }

    // Set image preview for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Clear website images and selected image
    handleImageSelect('');
    setRecipeUrl('');

    // Set image in recipe state
    setNewRecipe({ ...currentRecipe, image: file.name });
  };

  const handleGenerateImage = async (
    recipeTitle: string,
    stylePreferences: string[],
    generateRecipe: any,
    searchRecipeImagesStandalone: any,
    setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void,
    currentRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>
  ) => {
    if (!recipeTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe title to generate an image",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    setGenerationProgress("Starting AI image generation...");

    try {
      const prompt = `Generate a mouth-watering photo of ${recipeTitle} recipe, ${stylePreferences.join(', ')}`;
      setGenerationProgress("Crafting the perfect image prompt...");

      const response = await generateRecipe({
        prompt,
        stylePreferences,
        searchRecipeImages: async () => {
          if (recipeTitle.trim()) {
            return await searchRecipeImagesStandalone(recipeTitle);
          }
          return [];
        }
      });
      setGenerationProgress("Almost there, just putting the finishing touches...");

      if (response?.image) {
        setGeneratedImage(response.image);
        setNewRecipe({ ...currentRecipe, image: response.image });
        setImagePreview(response.image);
        toast({
          title: "Image generated successfully!",
          description: "Feast your eyes on this AI-generated deliciousness"
        });
      } else {
        throw new Error("Failed to generate image");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: "Image Generation Failed",
        description: error.message || "Please try again with a different title or style",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
      setGenerationProgress("");
    }
  };

  return {
    generatedImage,
    setGeneratedImage,
    isGeneratingImage,
    setIsGeneratingImage,
    generationProgress,
    setGenerationProgress,
    imagePreview,
    setImagePreview,
    fileInputRef,
    handleImageChange,
    handleGenerateImage,
  };
}
