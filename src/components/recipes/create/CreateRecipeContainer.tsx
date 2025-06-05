
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeUrlTab } from "./tabs/RecipeUrlTab";
import { RecipeImageTab } from "./tabs/RecipeImageTab";
import { RecipeAiTab } from "./tabs/RecipeAiTab";
import { RecipeForm } from "./RecipeForm";
import { EnhancedImageUpload } from "./EnhancedImageUpload";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRecipeState } from "@/hooks/useRecipeState";
import { useRecipeImageHandling } from "@/hooks/useRecipeImageHandling";
import { useRecipeSubmissionHandler } from "./RecipeSubmissionHandler";

export function CreateRecipeContainer() {
  useDocumentTitle("Add Recipe | RealiMeali");
  const { isLoadingMembers } = useHousehold();
  const [activeTab, setActiveTab] = useState("manual");

  // Custom hooks for state management
  const {
    newRecipe,
    setNewRecipe,
    shareWithCommunity,
    setShareWithCommunity,
    handleInputChange,
    handleIngredientsChange,
    handleInstructionsChange,
  } = useRecipeState();

  const {
    imagePreview,
    setImagePreview,
    isGeneratingImage,
    generationProgress,
    handleImageChange,
    handleGenerateImage,
  } = useRecipeImageHandling();

  const { handleSubmit, handleShareRecipe } = useRecipeSubmissionHandler();

  // Recipe processing hooks
  const {
    recipeText,
    setRecipeText,
    handleProcessText,
    recipeUrl,
    setRecipeUrl,
    websiteImages,
    storedImages,
    isDownloadingImages,
    isSearchingImages,
    showCommunityDialog,
    setShowCommunityDialog,
    parsedRecipeData,
    showImageSelection,
    selectedImage,
    handleImportFromUrl,
    handleDownloadImages,
    handleImageSelect,
    processImage,
    generateRecipe,
    aiPrompt,
    setAiPrompt,
    stylePreferences,
    setStylePreferences,
    searchRecipeImagesStandalone,
    clearSearchedImages,
    isProcessing,
    importProgress,
    progressValue,
  } = useRecipeProcessing();

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await processImage(file, setNewRecipe, newRecipe, setActiveTab, async () => {
        if (newRecipe.title.trim()) {
          return await searchRecipeImagesStandalone(newRecipe.title);
        }
        return [];
      });
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  // Wrapped handlers for the new hooks
  const wrappedHandleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setNewRecipe, handleImageSelect, setRecipeUrl);
  };

  const wrappedHandleGenerateImage = () => {
    handleGenerateImage(
      newRecipe.title,
      stylePreferences,
      generateRecipe,
      searchRecipeImagesStandalone,
      setNewRecipe
    );
  };

  const wrappedHandleSubmit = (e: React.FormEvent) => {
    handleSubmit(e, newRecipe, shareWithCommunity, setShowCommunityDialog);
  };

  const wrappedHandleShareRecipe = (recipeId: string, notes: string) => {
    handleShareRecipe(recipeId, notes, newRecipe.title);
  };

  if (isLoadingMembers) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-4 w-[350px]" />
        <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
          <Skeleton className="col-span-2 h-12" />
          <Skeleton className="col-span-2 h-12" />
          <Skeleton className="col-span-2 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:flex lg:space-x-8">
      {/* Left column: Image Upload */}
      <div className="lg:w-1/3 mb-6 lg:mb-0">
        <EnhancedImageUpload
          imagePreview={imagePreview}
          isGenerating={isGeneratingImage}
          generationProgress={generationProgress}
          onImageChange={wrappedHandleImageChange}
          onGenerateImage={wrappedHandleGenerateImage}
          recipeTitle={newRecipe.title}
          websiteImages={websiteImages}
          storedImages={storedImages}
          selectedImage={selectedImage}
          onImageSelect={handleImageSelect}
          onDownloadImages={() => handleDownloadImages(recipeUrl)}
          isDownloadingImages={isDownloadingImages}
          onSearchImages={async () => {
            if (newRecipe.title.trim()) {
              return await searchRecipeImagesStandalone(newRecipe.title);
            }
            return [];
          }}
          isSearchingImages={isSearchingImages}
        />
      </div>

      {/* Right column: Recipe Form and Tabs */}
      <div className="lg:w-2/3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="url">Website URL</TabsTrigger>
            <TabsTrigger value="image">Image Upload</TabsTrigger>
            <TabsTrigger value="ai">AI Generation</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <RecipeForm
              newRecipe={newRecipe}
              setNewRecipe={setNewRecipe}
              handleInputChange={handleInputChange}
              handleIngredientsChange={handleIngredientsChange}
              handleInstructionsChange={handleInstructionsChange}
              handleSubmit={wrappedHandleSubmit}
              setShareWithCommunity={setShareWithCommunity}
              shareWithCommunity={shareWithCommunity}
              handleShareRecipe={wrappedHandleShareRecipe}
            />
          </TabsContent>
          <TabsContent value="url">
            <RecipeUrlTab
              recipeUrl={recipeUrl}
              setRecipeUrl={setRecipeUrl}
              isProcessing={isProcessing}
              importProgress={importProgress}
              progressValue={progressValue}
              onImportWithImages={() => handleImportFromUrl(setNewRecipe, newRecipe, setActiveTab, setShareWithCommunity)}
              showCommunityDialog={showCommunityDialog}
              setShowCommunityDialog={setShowCommunityDialog}
              parsedRecipeData={parsedRecipeData}
              websiteImages={websiteImages}
              storedImages={storedImages}
              selectedImage={selectedImage}
              onImageSelect={handleImageSelect}
              onDownloadImages={() => handleDownloadImages(recipeUrl)}
              isDownloadingImages={isDownloadingImages}
              showImageSelection={showImageSelection}
            />
          </TabsContent>
          <TabsContent value="image">
            <RecipeImageTab
              isProcessing={isProcessing}
              onProcessImage={(file: File) => processImage(file, setNewRecipe, newRecipe, setActiveTab, async () => {
                if (newRecipe.title.trim()) {
                  return await searchRecipeImagesStandalone(newRecipe.title);
                }
                return [];
              })}
              importProgress={importProgress}
              progressValue={progressValue}
            />
          </TabsContent>
          <TabsContent value="ai">
            <RecipeAiTab
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              stylePreferences={stylePreferences}
              setStylePreferences={setStylePreferences}
              onGenerateRecipe={wrappedHandleGenerateImage}
              isGenerating={isGeneratingImage}
              generationProgress={generationProgress}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export type RecipeOrigin = 'manual' | 'url' | 'image' | 'ai';
