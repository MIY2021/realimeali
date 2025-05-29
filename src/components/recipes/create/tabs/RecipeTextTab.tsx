
import { Button } from "@/components/ui/button";

interface RecipeTextTabProps {
  recipeText: string;
  setRecipeText: (text: string) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export function RecipeTextTab({ 
  recipeText, 
  setRecipeText, 
  isProcessing, 
  onProcess 
}: RecipeTextTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Paste Your Recipe</label>
        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder="Paste your recipe text here and we'll extract the ingredients and instructions for you..."
          className="w-full h-48 sm:h-64 p-3 sm:p-4 border rounded-lg resize-none text-sm sm:text-base"
        />
      </div>
      <Button 
        onClick={onProcess} 
        disabled={isProcessing || !recipeText.trim()}
        className="w-full h-11 sm:h-10"
      >
        {isProcessing ? "Processing..." : "Extract Recipe Details"}
      </Button>
    </div>
  );
}
