
import { TabsContent } from "@/components/ui/tabs";
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
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
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
          <div className="space-y-6">
            <RecipeUrlTab
              recipeUrl={recipeProcessingHook.recipeUrl}
              setRecipeUrl={recipeProcessingHook.setRecipeUrl}
              isProcessing={recipeProcessingHook.isProcessing}
              onImportWithImages={onImportFromUrlWithImages}
            />
            
            {/* Show image selection if images are available */}
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
          </div>
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
            isProcessing={recipeProcessingHook.isProcessing}
            onGenerate={onGenerateRecipe}
          />
        </TabsContent>

        <TabsContent value="manual">
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
            onImageChange={recipeFormHook.handleImageChange}
            onGenerateImage={onGenerateImage}
            onAddCategory={recipeFormHook.handleAddCategory}
            onRemoveCategory={recipeFormHook.handleRemoveCategory}
            onAddIngredient={recipeFormHook.handleAddIngredient}
            onRemoveIngredient={recipeFormHook.handleRemoveIngredient}
            onAddInstruction={recipeFormHook.handleAddInstruction}
            onRemoveInstruction={recipeFormHook.handleRemoveInstruction}
          />
        </TabsContent>
      </CreateRecipeTabNavigation>
    </div>
  );
}
