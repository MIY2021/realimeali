
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { CreateRecipeTabNavigation } from "./CreateRecipeTabNavigation";
import { RecipeTextTab } from "./tabs/RecipeTextTab";
import { RecipeUrlTab } from "./tabs/RecipeUrlTab";
import { RecipeImageTab } from "./tabs/RecipeImageTab";
import { RecipeGenerateTab } from "./tabs/RecipeGenerateTab";
import { RecipeManualTab } from "./tabs/RecipeManualTab";
import { EnhancedImageSelection } from "../dialog/EnhancedImageSelection";

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
  onSave: () => void;
  onCancel: () => void;
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
  onSave,
  onCancel,
}: CreateRecipeTabsWrapperProps) {
  
  // Recipe completion status
  const getRecipeCompletionStatus = () => {
    const { newRecipe } = recipeFormHook;
    const hasTitle = newRecipe.title.trim().length > 0;
    const hasIngredients = newRecipe.ingredients.length > 0;
    const hasInstructions = newRecipe.instructions.length > 0;

    return {
      isComplete: hasTitle && hasIngredients && hasInstructions,
      hasTitle,
      hasIngredients,
      hasInstructions,
    };
  };

  const status = getRecipeCompletionStatus();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-sm border-0 sm:border">
        <CreateRecipeTabNavigation 
          isMobile={isMobile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          <div className="p-4 sm:p-6">
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
                showCommunityDialog={recipeProcessingHook.showCommunityDialog}
                setShowCommunityDialog={recipeProcessingHook.setShowCommunityDialog}
                parsedRecipeData={recipeProcessingHook.parsedRecipeData}
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
          </div>
        </CreateRecipeTabNavigation>
      </div>

      {/* Simple Save/Cancel Section */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-lg border">
        <Button
          onClick={onSave}
          disabled={!status.isComplete || recipeProcessingHook.isProcessing}
          className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white h-11"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Recipe
        </Button>
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 sm:flex-initial h-11"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
