import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_LOADING_MESSAGES } from "./useUrlRecipeProcessing/constants";

const DEFAULT_PROMPT = `A high-quality editorial food photograph of {title}. The food is the centre of the image. Shot using soft natural daylight from the side. Shallow depth of field, sharp focus on the food, slight background blur. Modern cookbook photography style, realistic textures, appetising but not over-styled. Ultra-realistic, high detail, professional food photography, suitable for a premium meal planning app. Should reference ingredients within the recipe and incorporate it where possible while keeping image natural.`;

export function useImageGeneration() {
  const { toast } = useToast();

  const fetchPromptTemplate = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("id", "image_generation_prompt")
        .single();

      if (error || !data?.value) {
        console.warn("Could not fetch prompt template, using default:", error);
        return DEFAULT_PROMPT;
      }
      return data.value;
    } catch (error) {
      console.warn("Error fetching prompt template:", error);
      return DEFAULT_PROMPT;
    }
  };

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
      }, 2500);
      
      // Fetch the prompt template from database and replace {title}
      const promptTemplate = await fetchPromptTemplate();
      const styledPrompt = promptTemplate.replace(/{title}/g, title);
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: styledPrompt
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.imageUrl) {
        throw new Error('No image received from AI generation');
      }

      clearInterval(progressInterval);
      setGenerationProgress?.("✨ Professional cookbook image generated!");
      
      setImagePreview(data.imageUrl);
      setRecipeImage(data.imageUrl);
      
      toast({
        title: "Image Generated!",
        description: `Professional cookbook-style image created using Gemini! (${data.fileSizeMB}MB WebP)`,
      });

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
