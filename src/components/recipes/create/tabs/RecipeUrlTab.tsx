
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface RecipeUrlTabProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
  isProcessing: boolean;
  onImport: () => void;
  onImportWithImages?: () => void;
}

export function RecipeUrlTab({ 
  recipeUrl, 
  setRecipeUrl, 
  isProcessing, 
  onImport,
  onImportWithImages
}: RecipeUrlTabProps) {
  return (
    <div className="space-y-4">
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
      
      <div className="space-y-2">
        <Button 
          onClick={onImport} 
          disabled={isProcessing || !recipeUrl.trim()}
          className="w-full"
        >
          {isProcessing ? "Importing..." : "Import Recipe Only"}
        </Button>
        
        {onImportWithImages && (
          <Button 
            onClick={onImportWithImages} 
            disabled={isProcessing || !recipeUrl.trim()}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isProcessing ? "Importing..." : "Import Recipe + Download Images"}
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
        <p><strong>Import Recipe Only:</strong> Extracts recipe text and shows image previews</p>
        <p><strong>Import + Download:</strong> Also saves images to our servers for reliable access</p>
      </div>
    </div>
  );
}
