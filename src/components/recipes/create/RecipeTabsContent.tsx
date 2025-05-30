
import { TabsContent } from "@/components/ui/tabs";
import { RecipeTextTab } from "./tabs/RecipeTextTab";
import { RecipeUrlTab } from "./tabs/RecipeUrlTab";
import { RecipeImageTab } from "./tabs/RecipeImageTab";
import { RecipeGenerateTab } from "./tabs/RecipeGenerateTab";
import { RecipeManualTab } from "./tabs/RecipeManualTab";
import { EnhancedImageSelection } from "../dialog/EnhancedImageSelection";

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
    <div className="p-3 sm:p-4">
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
        />
      </TabsContent>

      <TabsContent value="generate">
        <RecipeGenerateTab
          aiPrompt={recipeProcessingHook.aiPrompt}
          setAiPrompt={recipeProcessingHook.setAiPrompt}
          stylePreferences={recipeProcessingHook.stylePreferences}
          setStylePreferences={recipeProcessingHook.setStylePreferences}
          isProcessing={recipeProcessingHook.isProcessing}
          onGenerate={onGenerateRecipe}
        />
      </TabsContent>

      <TabsContent value="manual">
        <div className="space-y-4 sm:space-y-6">
          {/* Show image selection if images are available from website import */}
          {(recipeProcessingHook.websiteImages.length > 0 || recipeProcessingHook.storedImages.length > 0) && (
            <EnhancedImageSelection
              images={recipeProcessingHook.websiteImages}
              storedImages={recipeProcessingHook.storedImages}
              selectedImage={recipeFormHook.newRecipe.image || ""}
              onImageSelect={(url) => recipeFormHook.setNewRecipe({ 
                ...recipeFormHook.newRecipe, 
                image: url 
              })}
              onDownloadImages={recipeProcessingHook.handleDownloadImages}
              isDownloading={recipeProcessingHook.isDownloadingImages}
            />
          )}
          
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
          />
        </div>
      </TabsContent>
    </div>
  );
}
