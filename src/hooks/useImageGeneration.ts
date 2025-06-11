
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
      // Start the imagery-focused loading animation
      const shuffledMessages = [...IMAGE_LOADING_MESSAGES].sort(() => Math.random() - 0.5);
      let messageIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (messageIndex < shuffledMessages.length) {
          setGenerationProgress?.(shuffledMessages[messageIndex]);
          messageIndex++;
        }
      }, 800);
      
      // Create enhanced prompt that includes title, description, ingredients, and instructions
      let prompt = `Generate a hyper-realistic, top-down food photograph of the recipe: "${title}"`;
      
      // Add description context if available
      if (description && description.trim()) {
        prompt += ` - ${description.trim()}`;
      }
      
      // Add ingredients context if available
      if (ingredients && ingredients.length > 0) {
        const mainIngredients = ingredients.slice(0, 5); // Use first 5 ingredients to avoid overly long prompts
        prompt += `. Key ingredients include: ${mainIngredients.join(', ')}`;
      }
      
      // Add cooking method context from instructions if available
      if (instructions && instructions.length > 0) {
        const cookingMethods = instructions.join(' ').toLowerCase();
        if (cookingMethods.includes('bake') || cookingMethods.includes('oven')) {
          prompt += '. Baked dish';
        } else if (cookingMethods.includes('fry') || cookingMethods.includes('pan')) {
          prompt += '. Pan-fried dish';
        } else if (cookingMethods.includes('grill')) {
          prompt += '. Grilled dish';
        } else if (cookingMethods.includes('boil') || cookingMethods.includes('simmer')) {
          prompt += '. Boiled/simmered dish';
        } else if (cookingMethods.includes('roast')) {
          prompt += '. Roasted dish';
        }
      }
      
      // Add the detailed styling instructions
      prompt += `. Use natural lighting with soft shadows and realistic textures. Plate the dish in a ceramic or rustic-style plate or bowl. Garnish only with ingredients specifically mentioned or clearly implied. The background should vary between images (e.g., linen, wood, stone, concrete) but always remain clean and natural. Include minimal, relevant props (e.g., a fork, a napkin, or herbs) only if they are contextually appropriate. The result must look like a professional, real-life food photograph with no digital or artificial appearance. Focus on authentic food presentation and natural colors.`;
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: prompt
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
      setGenerationProgress?.("✨ Image generated successfully!");
      
      setImagePreview(data.imageUrl);
      setRecipeImage(data.imageUrl);
      
      toast({
        title: "Image Generated!",
        description: "Enhanced recipe image has been generated using recipe details for better accuracy!",
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
