
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
  
  const onImportFromUrlWithImages = () => {
    // Set flag that recipe was imported from website and enable community sharing by default
    recipeFormHook.markAsWebsiteImport();
    recipeProcessingHook.handleImportFromUrl(
      recipeFormHook.setNewRecipe, 
      recipeFormHook.newRecipe, 
      setActiveTab,
      true // Always download images
    );
  };
  
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

  const onSave = () => {
    console.log("🚀 Save button clicked from CreateRecipeContainer");
    console.log("Recipe data being saved:", {
      title: recipeFormHook.newRecipe.title,
      ingredients: recipeFormHook.newRecipe.ingredients,
      instructions: recipeFormHook.newRecipe.instructions,
      categories: recipeFormHook.newRecipe.categories,
      prepTime: recipeFormHook.newRecipe.prepTime,
      cookTime: recipeFormHook.newRecipe.cookTime,
      servings: recipeFormHook.newRecipe.servings,
      hasImage: !!recipeFormHook.newRecipe.image,
      topTip: recipeFormHook.newRecipe.topTip
    });
    // Pass community sharing preference to save function
    handleSave(recipeFormHook.newRecipe, recipeFormHook.shareWithCommunity);
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
      onSave={onSave}
      onCancel={handleCancel}
    />
  );
}
