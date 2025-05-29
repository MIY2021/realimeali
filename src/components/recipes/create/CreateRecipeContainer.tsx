import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateRecipeHeader } from "./CreateRecipeHeader";
import { CreateRecipeTabsWrapper } from "./CreateRecipeTabsWrapper";
import { CreateRecipeActions } from "./CreateRecipeActions";

export function CreateRecipeContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { createRecipe } = useRecipes();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("manual");
  const [isSaving, setIsSaving] = useState(false);

  // Keep hooks as objects instead of destructuring
  const recipeFormHook = useRecipeForm();
  const recipeProcessingHook = useRecipeProcessing();

  const { handleGenerateImage } = useImageGeneration();

  const onGenerateImage = () => {
    handleGenerateImage(
      recipeFormHook.newRecipe.title,
      recipeFormHook.setImagePreview,
      (url: string) => recipeFormHook.setNewRecipe({ ...recipeFormHook.newRecipe, image: url }),
      recipeFormHook.setIsGeneratingImage,
      recipeFormHook.setGenerationProgress
    );
  };

  const handleSaveRecipe = async () => {
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "You must be logged in and have a household to save recipes",
        variant: "destructive",
      });
      return;
    }

    if (!recipeFormHook.newRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required",
        variant: "destructive",
      });
      return;
    }

    if (recipeFormHook.newRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    if (recipeFormHook.newRecipe.instructions.length === 0) {
      toast({
        title: "Error",
        description: "At least one instruction is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const recipeToSave = {
        ...recipeFormHook.newRecipe,
        household_id: currentHousehold.id,
      };

      const savedRecipe = await createRecipe(recipeToSave, currentHousehold.id);
      
      if (savedRecipe) {
        toast({
          title: "Success",
          description: "Recipe saved successfully!",
        });
        navigate("/my-recipes");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/my-recipes");
  };

  // Wrapper functions to match expected signatures
  const wrappedProcessText = () => recipeProcessingHook.handleProcessText(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  const wrappedProcessImage = (file: File) => recipeProcessingHook.handleProcessImage(file, recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  const wrappedGenerateRecipe = () => recipeProcessingHook.handleGenerateRecipe(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);
  const wrappedImportFromUrl = () => recipeProcessingHook.handleImportFromUrl(recipeFormHook.setNewRecipe, recipeFormHook.newRecipe, setActiveTab);

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 space-y-6">
      <CreateRecipeHeader onCancel={handleCancel} />
      
      <CreateRecipeTabsWrapper
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recipeFormHook={recipeFormHook}
        recipeProcessingHook={recipeProcessingHook}
        onProcessText={wrappedProcessText}
        onImportFromUrlWithImages={wrappedImportFromUrl}
        onProcessImage={wrappedProcessImage}
        onGenerateRecipe={wrappedGenerateRecipe}
        onGenerateImage={onGenerateImage}
        onSave={handleSaveRecipe}
        onCancel={handleCancel}
      />

      <CreateRecipeActions
        onSave={handleSaveRecipe}
        onCancel={handleCancel}
        isLoading={isSaving}
        isValid={!!(recipeFormHook.newRecipe.title.trim() && recipeFormHook.newRecipe.ingredients.length > 0 && recipeFormHook.newRecipe.instructions.length > 0)}
        shareWithCommunity={recipeFormHook.shareWithCommunity}
        setShareWithCommunity={recipeFormHook.setShareWithCommunity}
        wasImportedFromWebsite={recipeFormHook.wasImportedFromWebsite}
      />
    </div>
  );
}
