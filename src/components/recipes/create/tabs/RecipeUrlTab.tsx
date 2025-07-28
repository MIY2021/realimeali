import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CommunityRecipeSubmissionDialog } from "@/components/recipes/CommunityRecipeSubmissionDialog";
import { EnhancedImageSelection } from "@/components/recipes/dialog/EnhancedImageSelection";
import { AlertCircle, Check, Globe, Sparkles } from "lucide-react";

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
  const hasSuccessfullyImported = parsedRecipeData && !isProcessing;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Globe className="h-8 w-8 text-sage" />
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-navy">From Website</h2>
        <p className="text-muted-foreground">
          Import recipes directly from cooking websites with one click
        </p>
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
          disabled={isProcessing}
        />
      </div>
      
      {isProcessing && importProgress && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Processing website...</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="w-full" />
          <p className="text-sm text-blue-600">{importProgress}</p>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              If this is taking too long, you can cancel and try copying the recipe text instead using the "Paste Recipe Text" tab.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Success state with images */}
      {hasImages && !isProcessing && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            ✅ Recipe imported successfully! Found {websiteImages.length} images. Select one below or proceed to edit the recipe.
          </AlertDescription>
        </Alert>
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
