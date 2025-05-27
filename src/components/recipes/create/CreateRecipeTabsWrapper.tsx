
import { TabsContent } from "@/components/ui/tabs";
import { CreateRecipeTabNavigation } from "./CreateRecipeTabNavigation";
import { CreateRecipeActions } from "./CreateRecipeActions";
import { RecipeTextTab } from "./tabs/RecipeTextTab";
import { RecipeUrlTab } from "./tabs/RecipeUrlTab";
import { RecipeImageTab } from "./tabs/RecipeImageTab";
import { RecipeGenerateTab } from "./tabs/RecipeGenerateTab";
import { RecipeManualTab } from "./tabs/RecipeManualTab";
import { EnhancedImageSelection } from "../dialog/EnhancedImageSelection";
import { useRecipeSave } from "@/hooks/useRecipeSave";

interface CreateRecipeTabsWrapperProps {
  isMobile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recipeFormHook: any;
  recipeProcessingHook: any;
  onProcessText: () => void;
  onImportFromUrlWithImages: () => void;
  onProcessImage: (file: File) => void;
  onGenerateRecipe: () => void;
  onGenerateImage: () => void;
}

export function CreateRecipeTabsWrapper({
  isMobile,
  activeTab,
  setActiveTab,
  recipeFormHook,
  recipeProcessingHook,
  onProcessText,
  onImportFromUrlWithImages,
  onProcessImage,
  onGenerateRecipe,
  onGenerateImage,
}: CreateRecipeTabsWrapperProps) {
  const { handleCancel, handleSave } = useRecipeSave();

  // Determine if save button should be shown
  const shouldShowSaveButton = () => {
    if (activeTab === "manual") {
      // Show save button for manual tab if recipe has title, ingredients, and instructions
      return recipeFormHook.newRecipe.title.trim() && 
             recipeFormHook.newRecipe.ingredients.length > 0 && 
             recipeFormHook.newRecipe.instructions.length > 0;
    } else {
      // For other tabs, show save button if recipe was successfully processed
      return recipeFormHook.newRecipe.title.trim() && 
             recipeFormHook.newRecipe.ingredients.length > 0 && 
             recipeFormHook.newRecipe.instructions.length > 0 &&
             !recipeProcessingHook.isProcessing;
    }
  };

  const onSave = () => {
    handleSave(recipeFormHook.newRecipe);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-sm border-0 sm:border p-4 sm:p-6">
        <CreateRecipeTabNavigation 
          isMobile={isMobile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
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
              onImportWithImages={onImportFromUrlWithImages}
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
                newCategory={recipeFormHook.newCategory}
                setNewCategory={recipeFormHook.setNewCategory}
                newIngredient={recipeFormHook.newIngredient}
                setNewIngredient={recipeFormHook.setNewIngredient}
                newInstruction={recipeFormHook.newInstruction}
                setNewInstruction={recipeFormHook.setNewInstruction}
                imagePreview={recipeFormHook.imagePreview}
                isGeneratingImage={recipeFormHook.isGeneratingImage}
                generationProgress={recipeFormHook.generationProgress}
                onImageChange={recipeFormHook.handleImageChange}
                onGenerateImage={onGenerateImage}
                onAddCategory={recipeFormHook.handleAddCategory}
                onRemoveCategory={recipeFormHook.handleRemoveCategory}
                onAddIngredient={recipeFormHook.handleAddIngredient}
                onRemoveIngredient={recipeFormHook.handleRemoveIngredient}
                onAddInstruction={recipeFormHook.handleAddInstruction}
                onRemoveInstruction={recipeFormHook.handleRemoveInstruction}
              />
            </div>
          </TabsContent>
        </CreateRecipeTabNavigation>
      </div>

      {/* Conditional Save Button */}
      {shouldShowSaveButton() && (
        <div className="mt-8 pt-6 border-t">
          <CreateRecipeActions 
            isMobile={isMobile}
            onCancel={handleCancel}
            onSave={onSave}
            showBackButton={false}
          />
        </div>
      )}
    </div>
  );
}
