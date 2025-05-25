
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { RecipePreview } from "../RecipePreview";
import { Recipe } from "@/types";

interface RecipeUrlTabProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
  isProcessing: boolean;
  onImportWithImages: () => void;
  importedRecipe?: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
}

export function RecipeUrlTab({ 
  recipeUrl, 
  setRecipeUrl, 
  isProcessing, 
  onImportWithImages,
  importedRecipe
}: RecipeUrlTabProps) {
  return (
    <div className="space-y-4">
      {/* Show import form if no recipe imported yet */}
      {!importedRecipe?.title && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Recipe Website URL</label>
            <input
              type="url"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              placeholder="https://example.com/recipe"
              className="w-full p-4 border rounded-lg"
            />
          </div>
          
          <Button 
            onClick={onImportWithImages} 
            disabled={isProcessing || !recipeUrl.trim()}
            className="w-full flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            {isProcessing ? "Importing..." : "Import Recipe"}
          </Button>

          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <p>This will extract the recipe and download all images for selection</p>
          </div>
        </>
      )}

      {/* Show recipe preview if recipe has been imported */}
      {importedRecipe?.title && (
        <RecipePreview recipe={importedRecipe} />
      )}
    </div>
  );
}
