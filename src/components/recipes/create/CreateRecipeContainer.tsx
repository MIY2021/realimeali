
import { useState, useCallback } from "react";
import { RecipeForm } from "./RecipeForm";
import { Recipe } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeUrlTab } from "./tabs/RecipeUrlTab";
import { RecipeImageTab } from "./tabs/RecipeImageTab";
import { RecipeAiTab } from "./tabs/RecipeAiTab";
import { useRecipeProcessing } from "@/hooks/useRecipeProcessing";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCommunityRecipe } from "@/hooks/useCommunityRecipe";
import { EnhancedImageUpload } from "./EnhancedImageUpload";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { sanitizeRecipeData } from "@/utils/contentSanitizer";

export function CreateRecipeContainer() {
  useDocumentTitle("Add Recipe | RealiMeali");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentHousehold, isLoadingMembers } = useHousehold();
  const { shareRecipe } = useCommunityRecipe();
  const [activeTab, setActiveTab] = useState("manual");
  const [shareWithCommunity, setShareWithCommunity] = useState(false);

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

  // Recipe state
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    image: "",
    top_tip: "",
    household_id: currentHousehold?.id || "",
    is_favorite: false,
    has_cooked: false,
    meal_type: null,
    cuisine_region: null,
    diet_lifestyle: [],
    complexity_level: null,
    main_ingredient: null,
  });

  // Image generation state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecipe(prevRecipe => ({
      ...prevRecipe,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      setNewRecipe(prevRecipe => ({ ...prevRecipe, image: "" }));
      return;
    }

    // Set image preview for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Clear website images and selected image
    handleImageSelect('');
    setRecipeUrl('');

    // Set image in recipe state
    setNewRecipe(prevRecipe => ({ ...prevRecipe, image: file.name }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await processImage(file, setNewRecipe, newRecipe, setActiveTab, searchRecipeImagesStandalone);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  const handleIngredientsChange = (ingredients: string[]) => {
    setNewRecipe(prevRecipe => ({ ...prevRecipe, ingredients }));
  };

  const handleInstructionsChange = (instructions: string[]) => {
    setNewRecipe(prevRecipe => ({ ...prevRecipe, instructions }));
  };

  const handleGenerateImage = async () => {
    if (!newRecipe.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipe title to generate an image",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    setGenerationProgress("Starting AI image generation...");

    try {
      const prompt = `Generate a mouth-watering photo of ${newRecipe.title} recipe, ${stylePreferences.join(', ')}`;
      setGenerationProgress("Crafting the perfect image prompt...");

      const response = await generateRecipe({
        prompt,
        stylePreferences,
        searchRecipeImages: searchRecipeImagesStandalone
      });
      setGenerationProgress("Almost there, just putting the finishing touches...");

      if (response?.image) {
        setGeneratedImage(response.image);
        setNewRecipe(prevRecipe => ({ ...prevRecipe, image: response.image }));
        setImagePreview(response.image);
        toast({
          title: "Image generated successfully!",
          description: "Feast your eyes on this AI-generated deliciousness"
        });
      } else {
        throw new Error("Failed to generate image");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: "Image Generation Failed",
        description: error.message || "Please try again with a different title or style",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
      setGenerationProgress("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentHousehold?.id) {
      toast({
        title: "No Household",
        description: "Please create or join a household to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!newRecipe.title.trim() || !newRecipe.ingredients.length || !newRecipe.instructions.length) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize the recipe data
    const sanitizedRecipe = sanitizeRecipeData(newRecipe);

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sanitizedRecipe,
          household_id: currentHousehold.id,
          share_with_community: shareWithCommunity
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (shareWithCommunity) {
          setShowCommunityDialog(true);
        } else {
          toast({
            title: "Recipe created!",
            description: `"${newRecipe.title}" has been added to your collection.`,
          });
          navigate(`/recipe/${data.id}`);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to create recipe');
      }
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error creating recipe",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareRecipe = useCallback(async (recipeId: string, notes: string) => {
    try {
      await shareRecipe(recipeId, notes);
      toast({
        title: "Recipe shared!",
        description: `"${newRecipe.title}" has been shared with the community.`,
      });
      navigate(`/recipe/${recipeId}`);
    } catch (error: any) {
      console.error("Error sharing recipe:", error);
      toast({
        title: "Error sharing recipe",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowCommunityDialog(false);
    }
  }, [newRecipe.title, navigate, shareRecipe, toast]);

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
          onImageChange={handleImageUpload}
          onGenerateImage={handleGenerateImage}
          recipeTitle={newRecipe.title}
          websiteImages={websiteImages}
          storedImages={storedImages}
          selectedImage={selectedImage}
          onImageSelect={handleImageSelect}
          onDownloadImages={handleDownloadImages}
          isDownloadingImages={isDownloadingImages}
          onSearchImages={searchRecipeImagesStandalone}
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
              handleSubmit={handleSubmit}
              setShareWithCommunity={setShareWithCommunity}
              shareWithCommunity={shareWithCommunity}
              handleShareRecipe={handleShareRecipe}
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
              onDownloadImages={handleDownloadImages}
              isDownloadingImages={isDownloadingImages}
              showImageSelection={showImageSelection}
            />
          </TabsContent>
          <TabsContent value="image">
            <RecipeImageTab
              isProcessing={isProcessing}
              onProcessImage={(file: File) => processImage(file, setNewRecipe, newRecipe, setActiveTab, searchRecipeImagesStandalone)}
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
              onGenerateRecipe={handleGenerateImage}
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
