
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
      }, 1500); // Slower animation - changed from 800ms to 1500ms
      
      // Create the detailed prompt directly
      const detailedPrompt = `A photorealistic, professionally styled cookbook photo of ${title}. The dish is the clear focal point, beautifully plated and shot in a natural home or studio kitchen setting with soft, diffused lighting. The background is clean and minimal, such as wood, marble, linen or slate — subtle and textured but not distracting.

Adjust styling based on the food type:

• **Hearty mains (curries, pasta, stews, rice bowls, roasts):** Presented in a shallow ceramic bowl or rimmed plate, slightly cropped at the edge of the frame. Shot at a 45-degree or overhead angle. Ingredients look fresh, moist, and steaming hot if appropriate. Include subtle garnishes like herbs, lemon wedges, or a spoon.

• **Sandwiches, burgers, wraps:** Shown whole and slightly angled on a rustic board or plate. Use a side angle or close-up 3/4 profile to highlight layers (e.g., fillings, melted cheese, crusty bread). Include crumbs, paper wrapping, or pickle garnish nearby. Background should be soft-focus kitchen wood or linen.

• **Soups and broths:** Served in a deep bowl, with toppings or a drizzle (e.g., cream swirl, croutons, herbs). Shot directly overhead or at a slight 30–45° angle. Spoon and napkin optional at the edge of frame.

• **Salads:** Shot overhead to show color, composition and variety of ingredients. Served in a wide shallow bowl with visible textures — crunchy leaves, shiny dressings, and sprinkled seeds or herbs.

• **Desserts (cakes, brownies, tarts, puddings):** Beautifully styled single portions on a neutral plate, with crumbs, dusted sugar, or fruit garnish. Shot at a 45-degree angle or macro close-up to highlight texture (e.g. gooey centre, flaky crust). Warm, soft lighting enhances richness.

• **Breakfasts (pancakes, eggs, porridge):** Cozy, morning-style setting with natural light. Show stack height or texture up close (e.g. syrup pouring). Angle varies by dish — top-down for porridge or flatlays, 45° for eggs on toast.

• **Drinks (coffee, smoothies, cocktails):** Served in an appropriate glass or mug. Capture light reflecting through the drink. Use close-up or side-profile, with optional props like a napkin, straw, or garnish.

Image composition:
- The food should fill most of the frame, often with part of the bowl/plate cropped artistically.
- Depth of field should highlight the food, blurring the background naturally.
- No filters, no artificial gloss — just clean, vibrant, real-looking food.
- Styled like a modern, minimal high-end food magazine or cookbook.

Lighting: natural daylight style or softbox imitation — bright but soft shadows. Colors are natural, slightly warm, never oversaturated.`;

      // Add context from ingredients and description naturally
      let contextualPrompt = detailedPrompt;
      if (description && description.trim()) {
        contextualPrompt += `\n\nRecipe context: ${description.trim()}`;
      }
      if (ingredients && ingredients.length > 0) {
        const mainIngredients = ingredients.slice(0, 5);
        contextualPrompt += `\n\nKey visible ingredients: ${mainIngredients.join(', ')}`;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { 
          prompt: contextualPrompt
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
        description: `Professional cookbook-style image created using DALL-E 3! (${data.fileSizeMB}MB PNG)`,
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
