import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_LOADING_MESSAGES } from "./useUrlRecipeProcessing/constants";

const DEFAULT_PROMPT = `A high-quality editorial food photograph of {title}.

Create a believable, appetising photograph of the finished dish, using the full recipe context below. The food should look like something a great cookbook or food magazine would actually photograph: natural, tactile, delicious and appropriately styled for the cuisine.

Important visual rule: do NOT fall back to a generic centred 45-degree food shot. Each generated image should have its own photographic identity. Vary the camera viewpoint, framing, presentation, setting and lighting while keeping the food itself accurate to the recipe.

The visual direction supplied with this prompt is intentional. Follow it closely, but adapt it naturally to the dish. Props, garnishes and backgrounds must support the food rather than overpower it. Only show ingredients and elements that make sense for the recipe.

Modern cookbook photography with realistic textures, natural colour and believable food styling. No text, labels, borders, collage layouts or artificial-looking food. One coherent photograph.

Recipe context:

{description}

{ingredients}

{instructions}

The image must accurately represent the finished dish based on the recipe details above. The dish should appear as it would when prepared according to the instructions, including its likely texture, colour, shape, portion and serving vessel. Do not invent major ingredients or change the dish into a different cuisine.`;

const VARIATION_STORAGE_KEY = "realimeali-image-variation-history";

const CAMERA_ANGLES = [
  "45-degree dining perspective",
  "true overhead flat-lay",
  "near eye-level view",
  "low three-quarter angle",
  "30-degree elevated angle",
  "tight close-up at food level",
];

const COMPOSITIONS = [
  "classic centred hero composition",
  "off-centre rule-of-thirds composition with some negative space",
  "diagonal composition with the food leading through the frame",
  "tight crop where the dish fills most of the frame and some edges leave the image",
  "asymmetric editorial composition with the main dish weighted to one side",
  "wider contextual composition showing the meal within its setting",
];

const PRESENTATIONS = [
  "beautifully plated and ready to eat",
  "served in the pan, tray or cooking vessel where that suits the dish",
  "partially sliced or broken open to reveal texture and layers",
  "just-served presentation with natural finishing details",
  "a close serving moment, such as sauce being spooned or food being portioned",
  "a relaxed, slightly rustic presentation that feels genuinely homemade",
];

const SETTINGS = [
  "light natural kitchen surface",
  "warm wooden dining table",
  "dark rustic timber surface",
  "neutral stone or ceramic surface",
  "casual home dining setting with a softly blurred background",
  "simple restaurant-style table setting",
];

const LIGHTING = [
  "soft daylight from a nearby window",
  "bright natural daytime light with gentle shadows",
  "directional side light that emphasises texture",
  "warm late-afternoon light",
  "soft backlight with a subtle glow around the food",
  "slightly moodier evening restaurant light while keeping the food clearly visible",
];

const HUMAN_ELEMENTS = [
  "no people or hands visible",
  "a natural hand entering the frame to serve the food",
  "a hand using a fork, spoon or knife naturally",
  "a subtle just-served action such as pouring, spooning or finishing the dish",
  "cutlery and serving utensils present naturally without becoming the subject",
];

function chooseVariationIndex(length: number, used: number[]): number {
  const available = Array.from({ length }, (_, index) => index).filter(
    index => !used.includes(index)
  );
  const pool = available.length > 0 ? available : Array.from({ length }, (_, index) => index);
  return pool[Math.floor(Math.random() * pool.length)];
}

function getImageVariationBrief(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let recent: string[] = [];
  try {
    const stored = window.localStorage.getItem(VARIATION_STORAGE_KEY);
    recent = stored ? JSON.parse(stored) : [];
  } catch {
    recent = [];
  }

  const usedAngles = recent.map(value => Number(value.split("-")[0])).filter(Number.isFinite);
  const usedCompositions = recent.map(value => Number(value.split("-")[1])).filter(Number.isFinite);
  const usedPresentations = recent.map(value => Number(value.split("-")[2])).filter(Number.isFinite);
  const usedSettings = recent.map(value => Number(value.split("-")[3])).filter(Number.isFinite);
  const usedLighting = recent.map(value => Number(value.split("-")[4])).filter(Number.isFinite);
  const usedHumans = recent.map(value => Number(value.split("-")[5])).filter(Number.isFinite);

  const angle = chooseVariationIndex(CAMERA_ANGLES.length, usedAngles);
  const composition = chooseVariationIndex(COMPOSITIONS.length, usedCompositions);
  const presentation = chooseVariationIndex(PRESENTATIONS.length, usedPresentations);
  const setting = chooseVariationIndex(SETTINGS.length, usedSettings);
  const lighting = chooseVariationIndex(LIGHTING.length, usedLighting);
  const human = chooseVariationIndex(HUMAN_ELEMENTS.length, usedHumans);

  const signature = `${angle}-${composition}-${presentation}-${setting}-${lighting}-${human}`;
  const nextRecent = [...recent, signature].slice(-8);

  try {
    window.localStorage.setItem(VARIATION_STORAGE_KEY, JSON.stringify(nextRecent));
  } catch {
    // Image generation still works if browser storage is unavailable.
  }

  return `Chosen photographic direction for this image:
- Camera: ${CAMERA_ANGLES[angle]}
- Composition: ${COMPOSITIONS[composition]}
- Food presentation: ${PRESENTATIONS[presentation]}
- Setting: ${SETTINGS[setting]}
- Lighting: ${LIGHTING[lighting]}
- Human/serving element: ${HUMAN_ELEMENTS[human]}

Do not combine this with the old generic centred-plate template. Make this direction visible in the final photograph while keeping the recipe authentic and the food as the clear subject.`;
}

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
      const shuffledMessages = [...IMAGE_LOADING_MESSAGES].sort(() => Math.random() - 0.5);
      let messageIndex = 0;

      const progressInterval = setInterval(() => {
        if (messageIndex < shuffledMessages.length) {
          setGenerationProgress?.(shuffledMessages[messageIndex]);
          messageIndex++;
        }
      }, 2500);

      const promptTemplate = await fetchPromptTemplate();

      const descriptionSection = description && description.trim()
        ? `\n\nRecipe Description: ${description.trim()}`
        : "";

      const ingredientsSection = ingredients && ingredients.length > 0
        ? `\n\nIngredients:\n${ingredients.map(ing => `- ${ing}`).join("\n")}`
        : "";

      const instructionsSection = instructions && instructions.length > 0
        ? `\n\nInstructions:\n${instructions.map((inst, idx) => `${idx + 1}. ${inst}`).join("\n")}`
        : "";

      let styledPrompt = promptTemplate
        .replace(/{title}/g, title)
        .replace(/{description}/g, descriptionSection)
        .replace(/{ingredients}/g, ingredientsSection)
        .replace(/{instructions}/g, instructionsSection);

      const variationBrief = getImageVariationBrief();
      if (variationBrief) {
        styledPrompt = `${styledPrompt}\n\n${variationBrief}`;
      }

      styledPrompt = styledPrompt.replace(/\n{3,}/g, "\n\n").trim();

      const { data, error } = await supabase.functions.invoke("generate-recipe-image", {
        body: {
          prompt: styledPrompt,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.imageUrl) {
        throw new Error("No image received from AI generation");
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
