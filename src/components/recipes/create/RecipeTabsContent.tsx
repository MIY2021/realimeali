import { TabsContent } from "@/components/ui/tabs";
import { RecipeTextTab } from "./tabs/RecipeTextTab";
import { RecipeUrlTab } from "./tabs/RecipeUrlTab";
import { RecipeImageTab } from "./tabs/RecipeImageTab";
import { RecipeGenerateTab } from "./tabs/RecipeGenerateTab";
import { RecipeManualTab } from "./tabs/RecipeManualTab";

interface RecipeTabsContentProps {
  isMobile: boolean;
  recipeFormHook: any;
  recipeProcessingHook: any;
  onProcessText: () => void;
  onImportFromUrlWithImages: () => void;
  onProcessImage: (file: File) => void;
  onGenerateRecipe: () => void;
  onGenerateImage: () => void;
}

export function RecipeTabsContent({
  isMobile,
  recipeFormHook,
  recipeProcessingHook,
  onProcessText,
  onImportFromUrlWithImages,
  onProcessImage,
  onGenerateRecipe,
  onGenerateImage,
}: RecipeTabsContentProps) {
  return (
    <div className="pt-0 p-0 sm:p-4 sm:pt-0">
      <TabsContent value="text">
        <RecipeTextTab
          recipeText={recipeProcessingHook.recipeText}
          setRecipeText={recipeProcessingHook.setRecipeText}
          isProcessing={recipeProcessingHook.isProcessing}
          onProcess={onProcessText}
        />
      </TabsContent>

      <TabsContent value="url">
        <RecipeUrlTab
          recipeUrl={recipeProcessingHook.recipeUrl}
          setRecipeUrl={recipeProcessingHook.setRecipeUrl}
          isProcessing={recipeProcessingHook.isProcessing}
          importProgress={recipeProcessingHook.importProgress}
          progressValue={recipeProcessingHook.progressValue}
          onImportWithImages={onImportFromUrlWithImages}
          showCommunityDialog={recipeProcessingHook.showCommunityDialog}
          setShowCommunityDialog={recipeProcessingHook.setShowCommunityDialog}
          parsedRecipeData={recipeProcessingHook.parsedRecipeData}
          websiteImages={recipeProcessingHook.websiteImages}
          storedImages={recipeProcessingHook.storedImages}
          selectedImage={recipeProcessingHook.selectedImage}
          onImageSelect={recipeProcessingHook.handleImageSelect}
          onDownloadImages={recipeProcessingHook.handleDownloadImages}
          isDownloadingImages={recipeProcessingHook.isDownloadingImages}
          showImageSelection={recipeProcessingHook.showImageSelection}
        />
      </TabsContent>

      <TabsContent value="image">
        <RecipeImageTab
          isProcessing={recipeProcessingHook.isProcessing}
          onProcessImage={onProcessImage}
          importProgress={recipeProcessingHook.importProgress}
          progressValue={recipeProcessingHook.progressValue}
        />
      </TabsContent>

      <TabsContent value="generate">
        <RecipeGenerateTab
          aiPrompt={recipeProcessingHook.aiPrompt}
          setAiPrompt={recipeProcessingHook.setAiPrompt}
          stylePreferences={recipeProcessingHook.stylePreferences}
          setStylePreferences={recipeProcessingHook.setStylePreferences}
          isProcessing={recipeProcessingHook.isProcessing}
          generationProgress={recipeProcessingHook.aiGenerationProgress}
          onGenerate={onGenerateRecipe}
        />
      </TabsContent>

      <TabsContent value="manual">
        <RecipeManualTab
          isMobile={isMobile}
          newRecipe={recipeFormHook.newRecipe}
          setNewRecipe={recipeFormHook.setNewRecipe}
          newIngredient={recipeFormHook.newIngredient}
          setNewIngredient={recipeFormHook.setNewIngredient}
          newInstruction={recipeFormHook.newInstruction}
          setNewInstruction={recipeFormHook.setNewInstruction}
          imagePreview={recipeFormHook.imagePreview}
          isGeneratingImage={recipeFormHook.isGeneratingImage}
          generationProgress={recipeFormHook.generationProgress}
          onImageChange={recipeFormHook.handleImageChange}
          onGenerateImage={onGenerateImage}
          onAddIngredient={recipeFormHook.handleAddIngredient}
          onRemoveIngredient={recipeFormHook.handleRemoveIngredient}
          onAddInstruction={recipeFormHook.handleAddInstruction}
          onRemoveInstruction={recipeFormHook.handleRemoveInstruction}
          websiteImages={recipeProcessingHook.websiteImages}
          storedImages={recipeProcessingHook.storedImages}
          selectedImage={recipeProcessingHook.selectedImage}
          onImageSelect={recipeProcessingHook.handleImageSelect}
          onDownloadImages={recipeProcessingHook.handleDownloadImages}
          isDownloadingImages={recipeProcessingHook.isDownloadingImages}
        />
      </TabsContent>
    </div>
  );
}
