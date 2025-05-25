
import { useState } from "react";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useRecipeSave } from "@/hooks/useRecipeSave";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { CreateRecipeTabsWrapper } from "./CreateRecipeTabsWrapper";
import { CreateRecipeActions } from "./CreateRecipeActions";
import { useIsMobile } from "@/hooks/use-mobile";

export function CreateRecipeContainer() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("text");

  // Custom hooks
  const recipeFormHook = useRecipeForm();
  const recipeProcessingHook = useRecipeProcessing();
  const { handleSave, handleCancel } = useRecipeSave();
  const { handleGenerateImage } = useImageGeneration();

  // Wrapper functions to pass the correct parameters
  const onProcessText = () => recipeProcessingHook.handleProcessText(
    recipeFormHook.setNewRecipe, 
    recipeFormHook.newRecipe, 
    setActiveTab
  );
  
  const onImportFromUrl = () => recipeProcessingHook.handleImportFromUrl(
    recipeFormHook.setNewRecipe, 
    recipeFormHook.newRecipe, 
    setActiveTab
  );
  
  const onProcessImage = (file: File) => recipeProcessingHook.handleProcessImage(
    file, 
    recipeFormHook.setNewRecipe, 
    recipeFormHook.newRecipe, 
    setActiveTab
  );
  
  const onGenerateRecipe = () => recipeProcessingHook.handleGenerateRecipe(
    recipeFormHook.setNewRecipe, 
    recipeFormHook.newRecipe, 
    setActiveTab
  );
  
  const onGenerateImage = () => {
    handleGenerateImage(
      recipeFormHook.newRecipe.title,
      recipeFormHook.setImagePreview,
      (url) => recipeFormHook.setNewRecipe({ ...recipeFormHook.newRecipe, image: url }),
      recipeFormHook.setIsGeneratingImage
    );
  };

  const onSave = () => handleSave(recipeFormHook.newRecipe);

  return (
    <>
      <CreateRecipeTabsWrapper
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recipeFormHook={recipeFormHook}
        recipeProcessingHook={recipeProcessingHook}
        onProcessText={onProcessText}
        onImportFromUrl={onImportFromUrl}
        onProcessImage={onProcessImage}
        onGenerateRecipe={onGenerateRecipe}
        onGenerateImage={onGenerateImage}
      />

      {/* Only show Create Recipe actions on Manual Entry tab */}
      {activeTab === "manual" && (
        <CreateRecipeActions 
          isMobile={isMobile}
          onCancel={handleCancel}
          onSave={onSave}
        />
      )}
    </>
  );
}
