
import { Label } from "@/components/ui/label";
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
      {/* Helper text - left aligned, reduced padding */}
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-3 rounded-lg">
          ✨ I'll automatically organize the title, ingredients, cooking steps, and suggest helpful categories!
        </div>
        <div className="sm:hidden">
          ✨ I'll automatically organize the title, ingredients, cooking steps, and suggest helpful categories!
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="recipe-text" className="text-base font-medium">Recipe Text</Label>
        <Textarea
          id="recipe-text"
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder="Paste any recipe here! From a website, cookbook, handwritten note, or even that crumpled paper from grandma. I'll organize it beautifully! ✨"
          className="w-full h-40 p-4 border rounded-lg resize-none text-base leading-relaxed"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onProcess}
          disabled={!recipeText.trim() || isProcessing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Process Recipe"}
        </button>
      </div>
    </div>
  );
}
