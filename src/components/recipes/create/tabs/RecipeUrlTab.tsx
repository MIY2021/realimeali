
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
  isDownloadingImages
}: RecipeUrlTabProps) {
  console.log('RecipeUrlTab render:', {
    websiteImages: websiteImages.length,
    storedImages: storedImages.length,
    selectedImage
  });

  return (
    <div className="space-y-4">
      {/* Helper text - left aligned, reduced padding */}
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-3 rounded-lg">
          🔗 Import recipes directly from cooking websites with one click! I'll automatically grab the recipe details and even find the photos for you. Works with most popular cooking websites and recipe blogs!
        </div>
        <div className="sm:hidden">
          🔗 Import recipes directly from cooking websites with one click! I'll automatically grab the recipe details and even find the photos for you. Works with most popular cooking websites and recipe blogs!
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
        <div className="text-center py-4">
          <div className="text-lg font-medium text-blue-600 mb-2">{importProgress}</div>
          <Progress value={progressValue} className="w-full h-3" />
          <div className="text-sm text-gray-500 mt-1">{Math.round(progressValue)}%</div>
        </div>
      )}

      {/* Always show image selection if we have images */}
      {(websiteImages.length > 0 || storedImages.length > 0) && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium mb-3">📸 Images found from website:</h3>
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
