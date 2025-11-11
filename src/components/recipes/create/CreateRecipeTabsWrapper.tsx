
import { CreateRecipeTabNavigation } from "./CreateRecipeTabNavigation";
import { RecipeTabsContent } from "./RecipeTabsContent";
import { RecipeSaveSection } from "./RecipeSaveSection";
import { useRecipeCompletionStatus } from "./RecipeCompletionStatus";
import { RecipeOrigin } from "./CreateRecipeContainer";

interface CreateRecipeTabsWrapperProps {
  isMobile: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recipeOrigin: RecipeOrigin;
  recipeFormHook: any;
  recipeProcessingHook: any;
  onProcessText: () => void;
  onImportFromUrlWithImages: () => void;
  onProcessImage: (file: File) => void;
  onGenerateRecipe: () => void;
  onGenerateImage: () => void;
  onSave: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
  isFromAI?: boolean;
  onSelectWhatCanIMakeRecipe?: (recipe: any) => void;
}

export function CreateRecipeTabsWrapper({
  isMobile,
  activeTab,
  setActiveTab,
  recipeOrigin,
  recipeFormHook,
  recipeProcessingHook,
  onProcessText,
  onImportFromUrlWithImages,
  onProcessImage,
  onGenerateRecipe,
  onGenerateImage,
  onSave,
  onCancel,
  isEditMode = false,
  isFromAI = false,
  onSelectWhatCanIMakeRecipe,
}: CreateRecipeTabsWrapperProps) {
  
  const status = useRecipeCompletionStatus({ newRecipe: recipeFormHook.newRecipe });

  return (
    <div className="space-y-6">
      <div className="bg-white/50 backdrop-blur-sm rounded-none sm:rounded-lg shadow-none sm:shadow-md border-0 sm:border border-white/20">
        <CreateRecipeTabNavigation 
          isMobile={isMobile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recipeOrigin={recipeOrigin}
          isEditMode={isEditMode}
          isFromAI={isFromAI}
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
            onSelectWhatCanIMakeRecipe={onSelectWhatCanIMakeRecipe}
          />
        </CreateRecipeTabNavigation>
      </div>

      {/* Only show save section on manual tab */}
      {activeTab === 'manual' && (
        <RecipeSaveSection
          wasGenerated={status.wasGenerated}
          isComplete={status.isComplete}
          isProcessing={recipeProcessingHook.isProcessing}
          onSave={onSave}
          onCancel={onCancel}
          recipeOrigin={recipeOrigin}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
}
