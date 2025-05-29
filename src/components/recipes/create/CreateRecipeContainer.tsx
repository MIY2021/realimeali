
import { useState } from "react";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useRecipeSave } from "@/hooks/useRecipeSave";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { CreateRecipeTabsWrapper } from "./CreateRecipeTabsWrapper";
import { useIsMobile } from "@/hooks/use-mobile";

export function CreateRecipeContainer() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("text");

  const recipeFormHook = useRecipeForm();
  const recipeProcessingHook = useRecipeProcessing();
  const { handleSave, handleCancel } = useRecipeSave();
  const { handleGenerateImage } = useImageGeneration();

  const onProcessText = () => recipeProcessingHook.handleProcessText(
    recipeFormHook.setNewRecipe, 
    recipeFormHook.newRecipe, 
    setActiveTab
  );
  
  const onImportFromUrlWithImages = () => recipeProcessingHook.handleImportFromUrl(
    recipeFormHook.setNewRecipe, 
    recipeFormHook.newRecipe, 
    setActiveTab,
    true // Always download images
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
      recipeFormHook.setIsGeneratingImage,
      recipeFormHook.setGenerationProgress
    );
  };

  return (
    <CreateRecipeTabsWrapper
      isMobile={isMobile}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      recipeFormHook={recipeFormHook}
      recipeProcessingHook={recipeProcessingHook}
      onProcessText={onProcessText}
      onImportFromUrlWithImages={onImportFromUrlWithImages}
      onProcessImage={onProcessImage}
      onGenerateRecipe={onGenerateRecipe}
      onGenerateImage={onGenerateImage}
    />
  );
}
