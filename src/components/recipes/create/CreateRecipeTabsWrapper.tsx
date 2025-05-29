
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { CreateRecipeTabNavigation } from "./CreateRecipeTabNavigation";
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

  const onSave = () => {
    // Basic validation before save
    const { newRecipe } = recipeFormHook;
    
    if (!newRecipe.title.trim()) {
      alert("Recipe title is required");
      return;
    }
    
    if (newRecipe.ingredients.length === 0) {
      alert("At least one ingredient is required");
      return;
    }
    
    if (newRecipe.instructions.length === 0) {
      alert("At least one instruction is required");
      return;
    }

    handleSave(newRecipe);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-sm border-0 sm:border">
        <CreateRecipeTabNavigation 
          isMobile={isMobile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          <div className="p-4 sm:p-6">
            <TabsContent value="text" className="animate-scale-in">
              <RecipeTextTab
                recipeText={recipeProcessingHook.recipeText}
                setRecipeText={recipeProcessingHook.setRecipeText}
                isProcessing={recipeProcessingHook.isProcessing}
                onProcess={onProcessText}
              />
            </TabsContent>

            <TabsContent value="url" className="animate-scale-in">
              <RecipeUrlTab
                recipeUrl={recipeProcessingHook.recipeUrl}
                setRecipeUrl={recipeProcessingHook.setRecipeUrl}
                isProcessing={recipeProcessingHook.isProcessing}
                onImportWithImages={onImportFromUrlWithImages}
              />
            </TabsContent>

            <TabsContent value="image" className="animate-scale-in">
              <RecipeImageTab
                isProcessing={recipeProcessingHook.isProcessing}
                onProcessImage={onProcessImage}
              />
            </TabsContent>

            <TabsContent value="generate" className="animate-scale-in">
              <RecipeGenerateTab
                aiPrompt={recipeProcessingHook.aiPrompt}
                setAiPrompt={recipeProcessingHook.setAiPrompt}
                stylePreferences={recipeProcessingHook.stylePreferences}
                setStylePreferences={recipeProcessingHook.setStylePreferences}
                isProcessing={recipeProcessingHook.isProcessing}
                onGenerate={onGenerateRecipe}
              />
            </TabsContent>

            <TabsContent value="manual" className="animate-scale-in">
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
                  imagePreview={recipeFormHook.imagePreview}
                  isGeneratingImage={recipeFormHook.isGeneratingImage}
                  generationProgress={recipeFormHook.generationProgress}
                  onImageChange={recipeFormHook.handleImageChange}
                  onGenerateImage={onGenerateImage}
                />
              </div>
            </TabsContent>
          </div>
        </CreateRecipeTabNavigation>
      </div>

      {/* Simplified Save/Cancel Section */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-200 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Button
            onClick={onSave}
            disabled={recipeProcessingHook.isProcessing}
            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white h-11 transition-all duration-200 hover:scale-105"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Recipe
          </Button>
          
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 sm:flex-initial h-11 transition-all duration-200 hover:scale-105"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <div className="text-center mt-3">
          <p className="text-sm text-gray-600">
            🎉 Ready to save your delicious recipe?
          </p>
        </div>
      </Card>
    </div>
  );
}
