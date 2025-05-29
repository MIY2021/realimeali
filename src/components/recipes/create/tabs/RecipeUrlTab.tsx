
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
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
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Recipe Website URL</label>
        <input
          type="url"
          value={recipeUrl}
          onChange={(e) => setRecipeUrl(e.target.value)}
          placeholder="https://example.com/recipe"
          className="w-full p-3 sm:p-4 border rounded-lg text-sm sm:text-base"
        />
      </div>
      
      {/* Progress indicator with funny messages */}
      {isProcessing && importProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">{importProgress}</p>
              <p className="text-xs text-blue-600">This might take a few moments...</p>
            </div>
          </div>
        </div>
      )}
      
      <Button 
        onClick={onImportWithImages} 
        disabled={isProcessing || !recipeUrl.trim()}
        className="w-full flex items-center gap-2 h-11 sm:h-10"
      >
        <ArrowRight className="h-4 w-4" />
        {isProcessing ? "Importing..." : "Import Recipe"}
      </Button>

      {parsedRecipeData && (
        <div className="border-t pt-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-3 border border-green-200">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800 mb-1">
                  🎉 Share with RealiMeali Community
                </p>
                <p className="text-xs text-green-700 mb-2">
                  Help other users discover this recipe! It will appear in the <strong>"Find Recipes"</strong> section after our moderation team approves it.
                </p>
                <p className="text-xs text-muted-foreground">
                  Only the recipe link and details are shared - the full recipe stays on the original website.
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCommunityDialog(true)}
            className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Users className="h-4 w-4" />
            Share with Community (appears in Find Recipes)
          </Button>
        </div>
      )}

      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
        <p>This will extract the recipe and switch to Manual Entry where you can select images and edit details</p>
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
