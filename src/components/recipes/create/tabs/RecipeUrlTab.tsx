
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RecipeUrlTabProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
  isProcessing: boolean;
  importProgress: string;
  onImportWithImages: () => void;
}

export function RecipeUrlTab({ 
  recipeUrl, 
  setRecipeUrl, 
  isProcessing,
  importProgress,
  onImportWithImages
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
      
      {/* Progress indicator */}
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
        <Plus className="h-4 w-4" />
        {isProcessing ? "Importing..." : "Import Recipe"}
      </Button>

      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
        <p>This will extract the recipe and switch to Manual Entry where you can select images and edit details</p>
      </div>
    </div>
  );
}
