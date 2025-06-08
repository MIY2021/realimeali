
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedImageUpload } from "../EnhancedImageUpload";
import { SimpleCategorySelector } from "../SimpleCategorySelector";
import { EnhancedIngredientManager } from "../EnhancedIngredientManager";
import { EnhancedInstructionManager } from "../EnhancedInstructionManager";
import { Recipe } from "@/types";

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
}: RecipeManualTabProps) {

  const handleIngredientsChange = (ingredients: string[]) => {
    setNewRecipe({ ...newRecipe, ingredients });
  };

  const handleInstructionsChange = (instructions: string[]) => {
    setNewRecipe({ ...newRecipe, instructions });
  };

  const handleUrlImageSelect = (url: string) => {
    console.log('🖼️ URL image selected in manual tab:', url);
    if (onImageSelect) {
      onImageSelect(url);
    }
    // Apply the selected image to the recipe data
    setNewRecipe({ ...newRecipe, image: url });
  };

  return (
    <div className="space-y-4">
      {/* Basic Information + Image - Two column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Basic Information - Takes up 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Recipe Title</Label>
              <Input
                id="title"
                value={newRecipe.title}
                onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                placeholder="Enter recipe title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={newRecipe.description}
                onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                placeholder="Brief description of the recipe"
                className="mt-1 min-h-20 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="prep-time" className="text-sm font-medium">Prep Time (min)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  value={newRecipe.prep_time || ''}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cook-time" className="text-sm font-medium">Cook Time (min)</Label>
                <Input
                  id="cook-time"
                  type="number"
                  value={newRecipe.cook_time || ''}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="servings" className="text-sm font-medium">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={newRecipe.servings || ''}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload - Takes up 1 column */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recipe Image</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedImageUpload
              imagePreview={imagePreview}
              isGenerating={isGeneratingImage}
              generationProgress={generationProgress}
              onImageChange={onImageChange}
              onGenerateImage={onGenerateImage}
              recipeTitle={newRecipe.title}
              websiteImages={websiteImages}
              storedImages={storedImages}
              selectedImage={selectedImage}
              onImageSelect={handleUrlImageSelect}
              onDownloadImages={onDownloadImages}
              isDownloadingImages={isDownloadingImages}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recipe Classification */}
      <SimpleCategorySelector
        recipe={newRecipe}
        onRecipeChange={setNewRecipe}
      />

      {/* Ingredients + Instructions - Two column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            onInstrctionsChange={handleInstructionsChange}
          />
        </div>
      </div>
    </div>
  );
}
