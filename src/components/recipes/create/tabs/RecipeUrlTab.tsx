
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { CommunityRecipeSubmissionDialog } from "@/components/recipes/CommunityRecipeSubmissionDialog";

interface RecipeUrlTabProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
  isProcessing: boolean;
  onImportWithImages: () => void;
  showCommunityDialog: boolean;
  setShowCommunityDialog: (show: boolean) => void;
  parsedRecipeData: any;
}

export function RecipeUrlTab({ 
  recipeUrl, 
  setRecipeUrl, 
  isProcessing, 
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
          <div className="bg-sage/10 p-3 rounded-lg mb-3">
            <p className="text-sm font-medium text-sage-dark mb-1">
              Share with RealiMeali Community
            </p>
            <p className="text-xs text-muted-foreground">
              Help other users discover this great recipe by adding it to our community database
            </p>
          </div>
          
          <Button
            onClick={() => setShowCommunityDialog(true)}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Share with Community
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
