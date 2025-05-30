
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
    showCommunityDialog: urlProcessing.showCommunityDialog,
    setShowCommunityDialog: urlProcessing.setShowCommunityDialog,
    parsedRecipeData: urlProcessing.parsedRecipeData,
    importProgress: urlProcessing.importProgress,
    progressValue: urlProcessing.progressValue,
    showImageSelection: urlProcessing.showImageSelection,
    selectedImage: urlProcessing.selectedImage,
    handleImportFromUrl: urlProcessing.handleImportFromUrl,
    handleDownloadImages: urlProcessing.handleDownloadImages,
    handleImageSelect: urlProcessing.handleImageSelect,
    
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
