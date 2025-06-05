
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
      
      // Create new hyper-realistic prompt that strictly uses title and description
      let prompt = `Generate a hyper-realistic, top-down food photograph of the recipe described in the provided title and description only: "${title}"`;
      
      // Add description context if available
      if (description && description.trim()) {
        prompt += ` - ${description.trim()}`;
      }
      
      // Add the new detailed instructions
      prompt += `. Do not invent ingredients or styling outside what's described. Use natural lighting with soft shadows and realistic textures. Plate the dish in a ceramic or rustic-style plate or bowl. Garnish only with ingredients specifically mentioned or clearly implied in the description. The background should vary between images (e.g., linen, wood, stone, concrete) but always remain clean and natural. Include minimal, relevant props (e.g., a fork, a napkin, or a wedge of cheese) only if they are contextually appropriate. The result must look like a professional, real-life food photograph with no digital or artificial appearance. Do not use imaginary or stylized elements. Use only the provided title and description as the source of truth for what the image contains.`;
      
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
        description: "Hyper-realistic recipe image has been generated and saved successfully!",
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
