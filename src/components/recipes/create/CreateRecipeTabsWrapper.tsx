
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Save, X } from "lucide-react";
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

  // Recipe completion status
  const getRecipeCompletionStatus = () => {
    const { newRecipe } = recipeFormHook;
    const hasTitle = newRecipe.title.trim().length > 0;
    const hasIngredients = newRecipe.ingredients.length > 0;
    const hasInstructions = newRecipe.instructions.length > 0;
    const hasDescription = newRecipe.description.trim().length > 0;
    const hasImage = !!newRecipe.image;
    const hasCategories = newRecipe.categories.length > 0;
    const hasTiming = newRecipe.prepTime > 0 || newRecipe.cookTime > 0;

    const required = [hasTitle, hasIngredients, hasInstructions];
    const optional = [hasDescription, hasImage, hasCategories, hasTiming];
    
    const requiredCount = required.filter(Boolean).length;
    const optionalCount = optional.filter(Boolean).length;
    
    return {
      isComplete: requiredCount === required.length,
      requiredCount,
      requiredTotal: required.length,
      optionalCount,
      optionalTotal: optional.length,
      hasTitle,
      hasIngredients,
      hasInstructions,
    };
  };

  const status = getRecipeCompletionStatus();

  const onSave = () => {
    handleSave(recipeFormHook.newRecipe);
  };

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

      {/* Enhanced Recipe Status & Save Section */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-200">
        <div className="space-y-4">
          {/* Completion Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recipe Status</h3>
            <div className="flex items-center gap-2">
              {status.isComplete ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready to Save
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Incomplete
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Required Fields:</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={status.hasTitle ? "text-green-600" : "text-gray-500"}>
                    {status.hasTitle ? "✓" : "○"} Recipe Title
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={status.hasIngredients ? "text-green-600" : "text-gray-500"}>
                    {status.hasIngredients ? "✓" : "○"} Ingredients ({recipeFormHook.newRecipe.ingredients.length})
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={status.hasInstructions ? "text-green-600" : "text-gray-500"}>
                    {status.hasInstructions ? "✓" : "○"} Instructions ({recipeFormHook.newRecipe.instructions.length})
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Optional ({status.optionalCount}/{status.optionalTotal}):
              </p>
              <div className="text-sm text-gray-600">
                {recipeFormHook.newRecipe.description && "✓ Description "}
                {recipeFormHook.newRecipe.image && "✓ Image "}
                {recipeFormHook.newRecipe.categories.length > 0 && `✓ Categories (${recipeFormHook.newRecipe.categories.length}) `}
                {(recipeFormHook.newRecipe.prepTime > 0 || recipeFormHook.newRecipe.cookTime > 0) && "✓ Timing "}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onSave}
              disabled={!status.isComplete || recipeProcessingHook.isProcessing}
              className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white h-11"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Recipe
            </Button>
            
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 sm:flex-initial h-11"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {!status.isComplete && (
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              💡 Complete the required fields (title, ingredients, instructions) to save your recipe.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
