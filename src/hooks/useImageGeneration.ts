
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useImageGeneration() {
  const { toast } = useToast();

  const handleGenerateImage = async (
    title: string,
    setImagePreview: (url: string) => void,
    setRecipeImage: (url: string) => void,
    setIsGeneratingImage: (loading: boolean) => void,
    setGenerationProgress?: (progress: number) => void,
    description?: string
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
      // Step 1: Start generation
      setGenerationProgress?.(10);
      
      // Create detailed prompt for photo-realistic food image
      let prompt = `Photo-realistic, professional food photography of ${title}`;
      
      // Add description context if available
      if (description && description.trim()) {
        prompt += `, ${description.trim()}`;
      }
      
      // Add photography specifications
      prompt += `, beautifully plated and styled, natural lighting, appetizing presentation, high-end restaurant quality, macro food photography, vibrant colors, garnished, professional culinary styling, depth of field, 4K quality`;
      
      setGenerationProgress?.(50);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: prompt
        },
      });

      if (error) {
        throw error;
      }

      // Step 2: Check for proper response structure
      if (!data?.imageUrl) {
        throw new Error('No image received from AI generation');
      }

      // Step 3: Set the image
      setGenerationProgress?.(100);
      setImagePreview(data.imageUrl);
      setRecipeImage(data.imageUrl);
      
      toast({
        title: "Image Generated!",
        description: "Photo-realistic recipe image has been generated and saved successfully!",
      });

    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
      setGenerationProgress?.(0);
    }
  };

  return { handleGenerateImage };
}
