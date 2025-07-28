
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Sparkles } from "lucide-react";

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
    <div className="space-y-6 p-4 sm:p-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Pencil className="h-8 w-8 text-sage" />
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-navy">Recipe Text</h2>
        <p className="text-muted-foreground">
          Paste a recipe from anywhere and our AI will format it perfectly
        </p>
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
