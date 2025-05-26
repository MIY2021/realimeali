
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useImageGeneration() {
  const { toast } = useToast();

  const handleGenerateImage = async (
    title: string,
    setImagePreview: (url: string) => void,
    setRecipeImage: (url: string) => void,
    setIsGeneratingImage: (loading: boolean) => void,
    setGenerationProgress?: (progress: string) => void
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
      setGenerationProgress?.("Creating your recipe image...");
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: `A delicious ${title}, food photography, professional lighting, appetizing presentation` 
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
      setGenerationProgress?.("Image generated successfully!");
      setImagePreview(data.imageUrl);
      setRecipeImage(data.imageUrl);
      
      toast({
        title: "Image Generated!",
        description: "Recipe image has been generated and saved successfully!",
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
      setGenerationProgress?.("");
    }
  };

  return { handleGenerateImage };
}
