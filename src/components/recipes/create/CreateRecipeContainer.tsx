
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useRecipeSave } from "@/hooks/useRecipeSave";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { CreateRecipeHeader } from "./CreateRecipeHeader";
import { CreateRecipeTabsWrapper } from "./CreateRecipeTabsWrapper";
import { CreateRecipeActions } from "./CreateRecipeActions";

export function CreateRecipeContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { createRecipe } = useRecipes();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("manual");
  const [isSaving, setIsSaving] = useState(false);

  const {
    newRecipe,
    setNewRecipe,
    newIngredient,
    setNewIngredient,
    newInstruction,
    setNewInstruction,
    imagePreview,
    setImagePreview,
    isGeneratingImage,
    setIsGeneratingImage,
    generationProgress,
    setGenerationProgress,
    shareWithCommunity,
    setShareWithCommunity,
    wasImportedFromWebsite,
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddInstruction,
    handleRemoveInstruction,
    handleImageChange,
  } = useRecipeForm();

  const {
    recipeText,
    setRecipeText,
    recipeUrl,
    setRecipeUrl,
    aiPrompt,
    setAiPrompt,
    stylePreferences,
    setStylePreferences,
    isProcessing,
    handleProcessText,
    handleImportFromUrl,
    handleProcessImage,
    handleGenerateRecipe,
  } = useRecipeProcessing();

  const { saveRecipe } = useRecipeSave();
  const { handleGenerateImage } = useImageGeneration();

  const onGenerateImage = () => {
    handleGenerateImage(
      newRecipe.title,
      setImagePreview,
      (url: string) => setNewRecipe({ ...newRecipe, image: url }),
      setIsGeneratingImage,
      setGenerationProgress
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

    if (!newRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required",
        variant: "destructive",
      });
      return;
    }

    if (newRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "At least one ingredient is required",
        variant: "destructive",
      });
      return;
    }

    if (newRecipe.instructions.length === 0) {
      toast({
        title: "Error",
        description: "At least one instruction is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Set default values for missing properties
      const recipeToSave = {
        ...newRecipe,
        topTip: newRecipe.topTip || "Enjoy cooking this delicious recipe!",
        householdId: currentHousehold.id,
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

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 space-y-6">
      <CreateRecipeHeader />
      
      <CreateRecipeTabsWrapper
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        newRecipe={newRecipe}
        setNewRecipe={setNewRecipe}
        newIngredient={newIngredient}
        setNewIngredient={setNewIngredient}
        newInstruction={newInstruction}
        setNewInstruction={setNewInstruction}
        imagePreview={imagePreview}
        isGeneratingImage={isGeneratingImage}
        generationProgress={generationProgress}
        onImageChange={handleImageChange}
        onGenerateImage={onGenerateImage}
        onAddIngredient={handleAddIngredient}
        onRemoveIngredient={handleRemoveIngredient}
        onAddInstruction={handleAddInstruction}
        onRemoveInstruction={handleRemoveInstruction}
        recipeText={recipeText}
        setRecipeText={setRecipeText}
        recipeUrl={recipeUrl}
        setRecipeUrl={setRecipeUrl}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        stylePreferences={stylePreferences}
        setStylePreferences={setStylePreferences}
        isProcessing={isProcessing}
        onProcessText={handleProcessText}
        onImportFromUrl={handleImportFromUrl}
        onProcessImage={handleProcessImage}
        onGenerateRecipe={handleGenerateRecipe}
      />

      <CreateRecipeActions
        onSave={handleSaveRecipe}
        onCancel={() => navigate("/my-recipes")}
        isSaving={isSaving}
        isValid={!!(newRecipe.title.trim() && newRecipe.ingredients.length > 0 && newRecipe.instructions.length > 0)}
        shareWithCommunity={shareWithCommunity}
        setShareWithCommunity={setShareWithCommunity}
        wasImportedFromWebsite={wasImportedFromWebsite}
      />
    </div>
  );
}
