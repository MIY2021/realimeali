
import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useRecipeSave } from "@/hooks/useRecipeSave";
import { useImageGeneration } from "@/hooks/useImageGeneration";

// Components
import { CreateRecipeHeader } from "@/components/recipes/create/CreateRecipeHeader";
import { CreateRecipeActions } from "@/components/recipes/create/CreateRecipeActions";
import { CreateRecipeTabNavigation } from "@/components/recipes/create/CreateRecipeTabNavigation";
import { RecipeTextTab } from "@/components/recipes/create/tabs/RecipeTextTab";
import { RecipeUrlTab } from "@/components/recipes/create/tabs/RecipeUrlTab";
import { RecipeImageTab } from "@/components/recipes/create/tabs/RecipeImageTab";
import { RecipeGenerateTab } from "@/components/recipes/create/tabs/RecipeGenerateTab";
import { RecipeManualTab } from "@/components/recipes/create/tabs/RecipeManualTab";

export default function CreateRecipePage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("text");

  // Custom hooks
  const {
    newRecipe,
    setNewRecipe,
    newCategory,
    setNewCategory,
    newIngredient,
    setNewIngredient,
    newInstruction,
    setNewInstruction,
    imagePreview,
    setImagePreview,
    isGeneratingImage,
    setIsGeneratingImage,
    handleAddCategory,
    handleRemoveCategory,
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
    isProcessing,
    handleProcessText,
    handleImportFromUrl,
    handleProcessImage,
    handleGenerateRecipe,
  } = useRecipeProcessing();

  const { handleSave, handleCancel } = useRecipeSave();
  const { handleGenerateImage } = useImageGeneration();

  // Wrapper functions to pass the correct parameters
  const onProcessText = () => handleProcessText(setNewRecipe, newRecipe, setActiveTab);
  const onImportFromUrl = () => handleImportFromUrl(setNewRecipe, newRecipe, setActiveTab);
  const onProcessImage = (file: File) => handleProcessImage(file, setNewRecipe, newRecipe, setActiveTab);
  const onGenerateRecipe = () => handleGenerateRecipe(setNewRecipe, newRecipe, setActiveTab);
  
  const onGenerateImage = () => {
    handleGenerateImage(
      newRecipe.title,
      setImagePreview,
      (url) => setNewRecipe({ ...newRecipe, image: url }),
      setIsGeneratingImage
    );
  };

  const onSave = () => handleSave(newRecipe);

  return (
    <div className="min-h-screen bg-cream">
      <div className="container max-w-4xl py-6">
        <CreateRecipeHeader onCancel={handleCancel} />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <CreateRecipeTabNavigation 
            isMobile={isMobile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          >
            <TabsContent value="text">
              <RecipeTextTab
                recipeText={recipeText}
                setRecipeText={setRecipeText}
                isProcessing={isProcessing}
                onProcess={onProcessText}
              />
            </TabsContent>

            <TabsContent value="url">
              <RecipeUrlTab
                recipeUrl={recipeUrl}
                setRecipeUrl={setRecipeUrl}
                isProcessing={isProcessing}
                onImport={onImportFromUrl}
              />
            </TabsContent>

            <TabsContent value="image">
              <RecipeImageTab
                isProcessing={isProcessing}
                onProcessImage={onProcessImage}
              />
            </TabsContent>

            <TabsContent value="generate">
              <RecipeGenerateTab
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                isProcessing={isProcessing}
                onGenerate={onGenerateRecipe}
              />
            </TabsContent>

            <TabsContent value="manual">
              <RecipeManualTab
                isMobile={isMobile}
                newRecipe={newRecipe}
                setNewRecipe={setNewRecipe}
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                newIngredient={newIngredient}
                setNewIngredient={setNewIngredient}
                newInstruction={newInstruction}
                setNewInstruction={setNewInstruction}
                imagePreview={imagePreview}
                isGeneratingImage={isGeneratingImage}
                onImageChange={handleImageChange}
                onGenerateImage={onGenerateImage}
                onAddCategory={handleAddCategory}
                onRemoveCategory={handleRemoveCategory}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
                onAddInstruction={handleAddInstruction}
                onRemoveInstruction={handleRemoveInstruction}
              />
            </TabsContent>
          </CreateRecipeTabNavigation>
        </div>

        {/* Only show Create Recipe actions on Manual Entry tab */}
        {activeTab === "manual" && (
          <CreateRecipeActions 
            isMobile={isMobile}
            onCancel={handleCancel}
            onSave={onSave}
          />
        )}
      </div>
    </div>
  );
}
