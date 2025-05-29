
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Paste your recipe text
        </label>
        <Textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder="Paste your recipe here..."
          className="min-h-[200px]"
        />
      </div>
      
      <Button
        onClick={onProcess}
        disabled={isProcessing || !recipeText.trim()}
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Process Recipe"}
      </Button>
    </div>
  );
}
