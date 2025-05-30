
import { CreateRecipeTabNavigation } from "./CreateRecipeTabNavigation";
import { RecipeTabsContent } from "./RecipeTabsContent";
import { RecipeSaveSection } from "./RecipeSaveSection";
import { useRecipeCompletionStatus } from "./RecipeCompletionStatus";

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
  
  const status = useRecipeCompletionStatus({ newRecipe: recipeFormHook.newRecipe });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-sm border-0 sm:border">
        <CreateRecipeTabNavigation 
          isMobile={isMobile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          <RecipeTabsContent
            isMobile={isMobile}
            recipeFormHook={recipeFormHook}
            recipeProcessingHook={recipeProcessingHook}
            onProcessText={onProcessText}
            onImportFromUrlWithImages={onImportFromUrlWithImages}
            onProcessImage={onProcessImage}
            onGenerateRecipe={onGenerateRecipe}
            onGenerateImage={onGenerateImage}
          />
        </CreateRecipeTabNavigation>
      </div>

      <RecipeSaveSection
        wasGenerated={status.wasGenerated}
        shareWithCommunity={recipeFormHook.shareWithCommunity}
        setShareWithCommunity={recipeFormHook.setShareWithCommunity}
        isComplete={status.isComplete}
        isProcessing={recipeProcessingHook.isProcessing}
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  );
}
