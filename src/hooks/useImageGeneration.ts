
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_LOADING_MESSAGES } from "./useUrlRecipeProcessing/constants";

export function useImageGeneration() {
  const { toast } = useToast();

  const handleGenerateImage = async (
    title: string,
    setImagePreview: (url: string) => void,
    setRecipeImage: (url: string) => void,
    setIsGeneratingImage: (loading: boolean) => void,
    setGenerationProgress?: (progress: string) => void,
    description?: string,
    ingredients?: string[],
    instructions?: string[]
  ) => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe title first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      // Start the slower imagery-focused loading animation
      const shuffledMessages = [...IMAGE_LOADING_MESSAGES].sort(() => Math.random() - 0.5);
      let messageIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (messageIndex < shuffledMessages.length) {
          setGenerationProgress?.(shuffledMessages[messageIndex]);
          messageIndex++;
        }
      }, 2500); // Much slower animation - changed from 1500ms to 2500ms
      
      // Use consistent editorial food photography style
      const styledPrompt = `A high-quality editorial food photograph of ${title}, a fresh, vibrant homemade meal served in a shallow ceramic bowl. The dish is the clear focal point, centred in the frame and filling most of the image. Ingredients are neatly arranged in defined sections, colourful but natural. Shot using soft natural daylight from the side, creating gentle highlights and subtle shadows. Clean white or very light stone background with no clutter or unnecessary props. Shallow depth of field, sharp focus on the food, slight background blur. Modern cookbook photography style, realistic textures, appetising but not over-styled. Ultra-realistic, high detail, professional food photography, suitable for a premium meal planning app.`;
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: styledPrompt
        },
      });

      if (error) {
        throw error;
      }

      // Check for proper response structure
      if (!data?.imageUrl) {
        throw new Error('No image received from AI generation');
      }

      // Clear the progress animation and complete
      clearInterval(progressInterval);
      setGenerationProgress?.("✨ Professional cookbook image generated!");
      
      setImagePreview(data.imageUrl);
      setRecipeImage(data.imageUrl);
      
      toast({
        title: "Image Generated!",
        description: `Professional cookbook-style image created using Gemini! (${data.fileSizeMB}MB WebP)`,
      });

      // Reset progress after a delay
      setTimeout(() => {
        setGenerationProgress?.("");
      }, 2000);

    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return { handleGenerateImage };
}
