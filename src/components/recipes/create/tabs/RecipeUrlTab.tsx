
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommunityRecipeSubmissionDialog } from "@/components/recipes/CommunityRecipeSubmissionDialog";

interface RecipeUrlTabProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
  isProcessing: boolean;
  importProgress: string;
  onImportWithImages: () => void;
  showCommunityDialog: boolean;
  setShowCommunityDialog: (show: boolean) => void;
  parsedRecipeData: any;
}

export function RecipeUrlTab({ 
  recipeUrl, 
  setRecipeUrl, 
  isProcessing, 
  importProgress,
  onImportWithImages,
  showCommunityDialog,
  setShowCommunityDialog,
  parsedRecipeData
}: RecipeUrlTabProps) {
  return (
    <div className="space-y-4">
      {/* Helper text - left aligned, reduced padding */}
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-3 rounded-lg">
          🔗 Import recipes directly from cooking websites with one click! I'll automatically grab the recipe details and even find the photos for you.
        </div>
        <div className="sm:hidden">
          🔗 Import recipes directly from cooking websites with one click! I'll automatically grab the recipe details and even find the photos for you.
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="website-url" className="text-base font-medium">Recipe Website URL</Label>
        <Input
          id="website-url"
          type="url"
          value={recipeUrl}
          onChange={(e) => setRecipeUrl(e.target.value)}
          placeholder="https://www.allrecipes.com/recipe/231506/simple-macaroni-and-cheese/"
          className="text-base p-4 h-12"
        />
        <p className="text-sm text-muted-foreground">
          Works with popular cooking websites like AllRecipes, Food Network, BBC Good Food, and many more!
        </p>
      </div>
      
      {isProcessing && importProgress && (
        <div className="text-center py-4">
          <div className="text-lg font-medium text-blue-600 mb-2">{importProgress}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
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
