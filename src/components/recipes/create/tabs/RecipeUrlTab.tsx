
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CommunityRecipeSubmissionDialog } from "@/components/recipes/CommunityRecipeSubmissionDialog";
import { EnhancedImageSelection } from "@/components/recipes/dialog/EnhancedImageSelection";

interface RecipeUrlTabProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
  isProcessing: boolean;
  importProgress: string;
  progressValue: number;
  onImportWithImages: () => void;
  showCommunityDialog: boolean;
  setShowCommunityDialog: (show: boolean) => void;
  parsedRecipeData: any;
  websiteImages: string[];
  storedImages: any[];
  selectedImage: string;
  onImageSelect: (url: string) => void;
  onDownloadImages: () => void;
  isDownloadingImages: boolean;
  showImageSelection: boolean;
}

export function RecipeUrlTab({ 
  recipeUrl, 
  setRecipeUrl, 
  isProcessing, 
  importProgress,
  progressValue,
  onImportWithImages,
  showCommunityDialog,
  setShowCommunityDialog,
  parsedRecipeData,
  websiteImages,
  storedImages,
  selectedImage,
  onImageSelect,
  onDownloadImages,
  isDownloadingImages,
  showImageSelection
}: RecipeUrlTabProps) {
  console.log('RecipeUrlTab render - Image Debug:', {
    websiteImages: websiteImages?.length || 0,
    storedImages: storedImages?.length || 0,
    showImageSelection,
    selectedImage: selectedImage ? 'has selected' : 'no selected',
    isProcessing
  });

  const hasImages = websiteImages && websiteImages.length > 0;

  return (
    <div className="space-y-4">
      {/* Helper text */}
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-3 rounded-lg">
          🔗 Import recipes from cooking websites! I'll try to automatically grab the recipe details and find photos. If it doesn't work, try the "Paste Recipe Text" tab instead.
        </div>
        <div className="sm:hidden">
          🔗 Import recipes from cooking websites! I'll try to automatically grab the recipe details and find photos. If it doesn't work, try the "Paste Recipe Text" tab instead.
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="website-url" className="text-base font-medium">Recipe Website URL</Label>
        <Input
          id="website-url"
          type="url"
          value={recipeUrl}
          onChange={(e) => setRecipeUrl(e.target.value)}
          placeholder="https://example-recipe-website.com/recipe/your-recipe"
          className="text-base p-4 h-12"
        />
      </div>
      
      {isProcessing && importProgress && (
        <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-center space-y-4">
            <div className="text-xl font-semibold text-blue-700 animate-pulse">
              {importProgress}
            </div>
            <div className="space-y-2">
              <Progress 
                value={progressValue} 
                className="w-full h-3 bg-blue-100" 
              />
              <div className="text-sm text-blue-600 font-medium">
                {Math.round(progressValue)}% complete
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show image selection if we have images */}
      {hasImages && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-3">📸 Images found from website ({websiteImages.length}):</h3>
          <EnhancedImageSelection
            images={websiteImages}
            storedImages={storedImages}
            selectedImage={selectedImage}
            onImageSelect={onImageSelect}
            onDownloadImages={onDownloadImages}
            isDownloading={isDownloadingImages}
          />
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          onClick={onImportWithImages}
          disabled={!recipeUrl.trim() || isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? "Importing..." : "Import Recipe"}
        </Button>
      </div>

      {showCommunityDialog && parsedRecipeData && (
        <CommunityRecipeSubmissionDialog
          isOpen={showCommunityDialog}
          onOpenChange={setShowCommunityDialog}
          initialData={parsedRecipeData}
        />
      )}
    </div>
  );
}
