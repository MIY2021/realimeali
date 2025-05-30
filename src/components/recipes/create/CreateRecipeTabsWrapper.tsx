import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Users } from "lucide-react";
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
  
  // Recipe completion status - check if recipe was actually generated
  const getRecipeCompletionStatus = () => {
    const { newRecipe } = recipeFormHook;
    const hasTitle = newRecipe.title.trim().length > 0;
    const hasIngredients = newRecipe.ingredients.length > 0;
    const hasInstructions = newRecipe.instructions.length > 0;
    
    // Check if recipe was actually generated/processed
    const wasGenerated = hasTitle && hasIngredients && hasInstructions && (
      newRecipe.title.length > 5 || // Likely generated content
      hasIngredients && hasInstructions // Has structured data
    );

    return {
      isComplete: hasTitle && hasIngredients && hasInstructions,
      wasGenerated,
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

      {/* Save/Cancel Section - Show when recipe is complete and generated */}
      {status.wasGenerated && (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border">
          {/* Community Sharing Checkbox - Show for all generated recipes */}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Checkbox
              id="shareWithCommunity"
              checked={recipeFormHook.shareWithCommunity}
              onCheckedChange={recipeFormHook.setShareWithCommunity}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label 
                htmlFor="shareWithCommunity" 
                className="text-sm font-medium text-green-800 cursor-pointer flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                🎉 Share with RealiMeali Community
              </label>
              <p className="text-xs text-green-700 mt-1">
                Help other users discover this recipe! It will appear in the "Find Recipes" section after our moderation team approves it.
                Only the recipe link and details are shared - the full recipe stays on the original website.
              </p>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
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
      )}
    </div>
  );
}
