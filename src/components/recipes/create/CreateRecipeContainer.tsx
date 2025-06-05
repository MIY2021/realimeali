
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed } from "lucide-react";
import { RecipeUrlTab } from "./tabs/RecipeUrlTab";
import { RecipeImageTab } from "./tabs/RecipeImageTab";
import { RecipeAiTab } from "./tabs/RecipeAiTab";
import { RecipeTextTab } from "./tabs/RecipeTextTab";
import { RecipeForm } from "./RecipeForm";
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
  const [activeTab, setActiveTab] = useState("url"); // Start with website import

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

  // Wrapped handlers for the new hooks
  const wrappedHandleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setNewRecipe, newRecipe, handleImageSelect, setRecipeUrl);
  };

  const wrappedHandleGenerateImage = () => {
    handleGenerateImage(
      newRecipe.title,
      stylePreferences,
      generateRecipe,
      searchRecipeImagesStandalone,
      setNewRecipe,
      newRecipe
    );
  };

  const wrappedHandleSubmit = (e: React.FormEvent) => {
    handleSubmit(e, newRecipe, shareWithCommunity, setShowCommunityDialog);
  };

  const wrappedHandleShareRecipe = (recipeId: string, notes: string) => {
    handleShareRecipe(recipeId, notes, newRecipe.title);
  };

  const wrappedHandleProcessText = () => {
    handleProcessText(setNewRecipe, newRecipe, setActiveTab, searchRecipeImagesStandalone);
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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Page Header - matching recipes page style */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Add Recipe</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Import from websites, upload photos, use AI, or create manually
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="url" className="text-sm">
              🌐 Website
            </TabsTrigger>
            <TabsTrigger value="image" className="text-sm">
              📸 Photo
            </TabsTrigger>
            <TabsTrigger value="text" className="text-sm">
              📝 Text
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-sm">
              🤖 AI Generate
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-sm">
              ✍️ Manual
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="text">
            <RecipeTextTab
              recipeText={recipeText}
              setRecipeText={setRecipeText}
              isProcessing={isProcessing}
              onProcess={wrappedHandleProcessText}
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
              imagePreview={imagePreview}
              isGeneratingImage={isGeneratingImage}
              generationProgress={generationProgress}
              onImageChange={wrappedHandleImageChange}
              onGenerateImage={wrappedHandleGenerateImage}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export type RecipeOrigin = 'manual' | 'url' | 'image' | 'ai' | 'text';
