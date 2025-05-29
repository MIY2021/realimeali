
import { useTextRecipeProcessing } from "./useTextRecipeProcessing";
import { useUrlRecipeProcessing } from "./useUrlRecipeProcessing";
import { useImageRecipeProcessing } from "./useImageRecipeProcessing";
import { useAiRecipeGeneration } from "./useAiRecipeGeneration";

export function useRecipeProcessing() {
  const textProcessing = useTextRecipeProcessing();
  const urlProcessing = useUrlRecipeProcessing();
  const imageProcessing = useImageRecipeProcessing();
  const aiGeneration = useAiRecipeGeneration();

  return {
    // Text processing
    recipeText: textProcessing.recipeText,
    setRecipeText: textProcessing.setRecipeText,
    handleProcessText: textProcessing.handleProcessText,
    
    // URL processing
    recipeUrl: urlProcessing.recipeUrl,
    setRecipeUrl: urlProcessing.setRecipeUrl,
    websiteImages: urlProcessing.websiteImages,
    storedImages: urlProcessing.storedImages,
    isDownloadingImages: urlProcessing.isDownloadingImages,
    handleImportFromUrl: urlProcessing.handleImportFromUrl,
    handleDownloadImages: urlProcessing.handleDownloadImages,
    
    // Image processing
    handleProcessImage: imageProcessing.handleProcessImage,
    
    // AI generation
    aiPrompt: aiGeneration.aiPrompt,
    setAiPrompt: aiGeneration.setAiPrompt,
    stylePreferences: aiGeneration.stylePreferences,
    setStylePreferences: aiGeneration.setStylePreferences,
    handleGenerateRecipe: aiGeneration.handleGenerateRecipe,
    
    // Combined processing state
    isProcessing: textProcessing.isProcessing || urlProcessing.isProcessing || imageProcessing.isProcessing || aiGeneration.isProcessing,
  };
}
