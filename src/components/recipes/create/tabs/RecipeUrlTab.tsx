import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[12px] border border-[#E3E3E3] shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <Label htmlFor="website-url" className="text-base font-medium text-[#1A1A1A] block text-center">Recipe Website URL</Label>
          <div className="relative mt-2">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B6B6B]" />
            <Input
              id="website-url"
              type="url"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              placeholder="https://example-recipe-website.com/recipe/your-recipe"
              className="text-sm pl-11 pr-4 h-12 rounded-[12px] border-[#E3E3E3] focus:border-sage focus:ring-sage placeholder:text-sm"
              disabled={isProcessing}
            />
          </div>
        </div>
      
        {isProcessing && importProgress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Processing website...</span>
              <span className="text-sm text-[#6B6B6B]">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="w-full" />
            <p className="text-sm text-sage font-medium">{importProgress}</p>
          </div>
        )}

        {/* Success state with images */}
        {hasImages && !isProcessing && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              ✅ Recipe imported successfully! Found {websiteImages.length} images. Select one below or proceed to edit the recipe.
            </AlertDescription>
          </Alert>
        )}

        {/* Show image selection if we have images */}
        {hasImages && (
          <div className="p-4 border border-[#E3E3E3] rounded-[12px] bg-[#FAF9F6]">
            <h3 className="text-sm font-medium mb-3 text-[#1A1A1A]">📸 Images found from website ({websiteImages.length}):</h3>
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
        
        <div className="flex justify-center pt-2">
          <Button
            onClick={onImportWithImages}
            disabled={!recipeUrl.trim() || isProcessing}
            className="bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A] rounded-[12px] min-h-[44px] shadow-[0_1px_0_rgba(0,0,0,0.04)] font-medium"
          >
            {isProcessing ? "Importing..." : "Import Recipe"}
          </Button>
        </div>
      </div>
    </div>
  );
}
