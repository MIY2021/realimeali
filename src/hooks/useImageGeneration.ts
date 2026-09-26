import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_LOADING_MESSAGES } from "./useUrlRecipeProcessing/constants";

const DEFAULT_PROMPT = `A high-quality editorial food photograph of {title}.

Composition: Randomly choose one of the following two compositions:
• Top-down (overhead) shot with the dish perfectly centred in the frame
• Side-on (45–90° angle) shot with the dish centred and clearly framed

In all cases, the food must be the absolute centre of attention, positioned in the middle of the image with no cropping of the main dish - and more or less fill the image.

Modern cookbook photography style. Realistic textures, natural colours, appetising but not over-styled. Professional food photography suitable for a premium meal planning app. Ensure you read and understand the full recipe before generating image:

{description}

{ingredients}

{instructions}

The image must accurately represent the finished dish based on the recipe details above. The dish should appear exactly as it would when prepared according to the instructions provided. Include visible ingredients from the recipe where appropriate, and ensure the styling, presentation, and appearance match how the dish would look when following the recipe instructions.`;

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
      
      // Fetch the prompt template from database and build comprehensive prompt
      const promptTemplate = await fetchPromptTemplate();
      
      // Build recipe context sections
      const descriptionSection = description && description.trim() 
        ? `\n\nRecipe Description: ${description.trim()}`
        : '';
      
      const ingredientsSection = ingredients && ingredients.length > 0
        ? `\n\nIngredients:\n${ingredients.map(ing => `- ${ing}`).join('\n')}`
        : '';
      
      const instructionsSection = instructions && instructions.length > 0
        ? `\n\nInstructions:\n${instructions.map((inst, idx) => `${idx + 1}. ${inst}`).join('\n')}`
        : '';
      
      // Replace placeholders in template
      let styledPrompt = promptTemplate
        .replace(/{title}/g, title)
        .replace(/{description}/g, descriptionSection)
        .replace(/{ingredients}/g, ingredientsSection)
        .replace(/{instructions}/g, instructionsSection);
      
      // Clean up any extra newlines
      styledPrompt = styledPrompt.replace(/\n{3,}/g, '\n\n').trim();
      
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
        description: `Professional cookbook-style image created with OpenAI! (${data.fileSizeMB}MB WebP)`,
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
