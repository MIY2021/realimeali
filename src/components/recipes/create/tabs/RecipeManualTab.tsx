
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedImageUpload } from "../EnhancedImageUpload";
import { SimpleCategorySelector } from "../SimpleCategorySelector";
import { EnhancedIngredientManager } from "../EnhancedIngredientManager";
import { EnhancedInstructionManager } from "../EnhancedInstructionManager";
import { Recipe } from "@/types";
import { RecipeOrigin } from "../hooks/useRecipeCreationHandlers";

interface StoredImage {
  originalUrl: string;
  storedUrl: string;
  filename: string;
}

interface RecipeManualTabProps {
  isMobile: boolean;
  newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
  setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  newIngredient: string;
  setNewIngredient: (ingredient: string) => void;
  newInstruction: string;
  setNewInstruction: (instruction: string) => void;
  imagePreview: string | null;
  isGeneratingImage: boolean;
  generationProgress: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onAddInstruction: () => void;
  onRemoveInstruction: (index: number) => void;
  websiteImages?: string[];
  storedImages?: StoredImage[];
  selectedImage?: string;
  onImageSelect?: (url: string) => void;
  onDownloadImages?: () => void;
  isDownloadingImages?: boolean;
  recipeOrigin?: RecipeOrigin;
}

export function RecipeManualTab({
  isMobile,
  newRecipe,
  setNewRecipe,
  newIngredient,
  setNewIngredient,
  newInstruction,
  setNewInstruction,
  imagePreview,
  isGeneratingImage,
  generationProgress,
  onImageChange,
  onGenerateImage,
  onAddIngredient,
  onRemoveIngredient,
  onAddInstruction,
  onRemoveInstruction,
  websiteImages = [],
  storedImages = [],
  selectedImage = "",
  onImageSelect,
  onDownloadImages,
  isDownloadingImages = false,
  recipeOrigin = 'manual',
}: RecipeManualTabProps) {

  const handleIngredientsChange = (ingredients: string[]) => {
    setNewRecipe({ ...newRecipe, ingredients });
  };

  const handleInstructionsChange = (instructions: string[]) => {
    setNewRecipe({ ...newRecipe, instructions });
  };

  const handleUrlImageSelect = async (url: string) => {
    console.log('🖼️ URL image selected in manual tab:', url);
    // Update the recipe image directly
    setNewRecipe({ ...newRecipe, image: url });
    // Also call the external handler if provided
    if (onImageSelect) {
      onImageSelect(url);
    }
    
    // Download the newly selected image and store it for upload during save
    if (url) {
      try {
        console.log('📥 Downloading newly selected image for upload...');
        const imageResponse = await fetch(url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        const imageFile = new File([imageBlob], 'recipe-image.jpg', { type: 'image/jpeg' });
        
        // Store the file in the recipe object so it can be used during save
        setNewRecipe(prev => ({ 
          ...prev, 
          image: url,
          downloadedImageFile: imageFile 
        }));
        
        console.log('✅ Newly selected image downloaded and ready for upload');
      } catch (error) {
        console.error('⚠️ Failed to download newly selected image:', error);
        // Continue with just the URL - the save handler will generate thumbnail from URL
        // Clear any existing downloadedImageFile
        setNewRecipe(prev => {
          const { downloadedImageFile, ...rest } = prev as any;
          return { ...rest, image: url };
        });
      }
    } else {
      // Clear the downloaded file if image is cleared
      setNewRecipe(prev => {
        const { downloadedImageFile, ...rest } = prev as any;
        return rest;
      });
    }
  };

  // Determine if recipe was imported (not manually entered)
  const isImported = recipeOrigin !== 'manual';

  // Recipe Image Card component (reusable)
  const RecipeImageCard = () => (
    <Card className="rounded-[12px] border border-[#E3E3E3] shadow-sm bg-white">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="text-base font-semibold text-[#1A1A1A]">Recipe Image</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <EnhancedImageUpload
          imagePreview={imagePreview}
          isGenerating={isGeneratingImage}
          generationProgress={generationProgress}
          onImageChange={onImageChange}
          onGenerateImage={onGenerateImage}
          onImageSelect={handleUrlImageSelect}
          recipeTitle={newRecipe.title}
          websiteImages={websiteImages}
          storedImages={storedImages}
          selectedImage={selectedImage}
          onDownloadImages={onDownloadImages}
          isDownloadingImages={isDownloadingImages}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-3">
      {/* Recipe Image - Show at top if manually entered, below summary if imported */}
      {!isImported && <RecipeImageCard />}

      {/* Basic Information */}
      <Card className="rounded-[12px] border border-[#E3E3E3] shadow-sm bg-white">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-base font-semibold text-[#1A1A1A]">Recipe Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 sm:px-6">
            <div>
              <Label htmlFor="title" className="text-xs sm:text-sm font-medium text-[#1A1A1A]">Recipe Title</Label>
              <Input
                id="title"
                value={newRecipe.title}
                onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                placeholder="Enter recipe title"
                className="mt-1 h-10 rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-xs sm:text-sm font-medium text-[#1A1A1A]">Description</Label>
              <Textarea
                id="description"
                value={newRecipe.description}
                onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                placeholder="Brief description of the recipe"
                className="mt-1 min-h-20 resize-none rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="top-tip" className="text-xs sm:text-sm font-medium text-[#1A1A1A]">Chef's Top Tip</Label>
              <Textarea
                id="top-tip"
                value={newRecipe.top_tip || ""}
                onChange={(e) => setNewRecipe({ ...newRecipe, top_tip: e.target.value })}
                placeholder="Share your best tip for making this recipe (optional)"
                className="mt-1 min-h-16 resize-none rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <Label htmlFor="prep-time" className="text-xs sm:text-sm font-medium text-[#1A1A1A]">Prep Time (min)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  value={newRecipe.prep_time || ''}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-1 h-10 rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
                />
              </div>
              <div>
                <Label htmlFor="cook-time" className="text-xs sm:text-sm font-medium text-[#1A1A1A]">Cook Time (min)</Label>
                <Input
                  id="cook-time"
                  type="number"
                  value={newRecipe.cook_time || ''}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-1 h-10 rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
                />
              </div>
              <div>
                <Label htmlFor="servings" className="text-xs sm:text-sm font-medium text-[#1A1A1A]">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={newRecipe.servings || ''}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                  className="mt-1 h-10 rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
                />
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Recipe Image - Show below summary if imported */}
      {isImported && <RecipeImageCard />}

      {/* Recipe Classification */}
      <SimpleCategorySelector
        recipe={newRecipe}
        onRecipeChange={setNewRecipe}
      />

      {/* Ingredients + Instructions - Two column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Enhanced Ingredients Manager */}
        <div className="lg:col-span-1">
          <EnhancedIngredientManager
            ingredients={newRecipe.ingredients || []}
            onIngredientsChange={handleIngredientsChange}
          />
        </div>

        {/* Enhanced Instructions Manager */}
        <div className="lg:col-span-1">
          <EnhancedInstructionManager
            instructions={newRecipe.instructions || []}
            onInstructionsChange={handleInstructionsChange}
          />
        </div>
      </div>
    </div>
  );
}
