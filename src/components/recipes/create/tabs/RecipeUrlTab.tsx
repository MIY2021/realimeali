
import { Button } from "@/components/ui/button";

interface RecipeUrlTabProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
  isProcessing: boolean;
  onImport: () => void;
}

export function RecipeUrlTab({ 
  recipeUrl, 
  setRecipeUrl, 
  isProcessing, 
  onImport 
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
      <Button 
        onClick={onImport} 
        disabled={isProcessing || !recipeUrl.trim()}
        className="w-full"
      >
        {isProcessing ? "Importing..." : "Import from Website"}
      </Button>
    </div>
  );
}
