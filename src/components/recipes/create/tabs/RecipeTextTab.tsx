
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[12px] border border-[#E3E3E3] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Pencil className="h-10 w-10 text-sage" />
            <Sparkles className="h-7 w-7 text-yellow-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">Recipe Text</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mx-auto">
            Paste a recipe from anywhere and our AI will format it perfectly
          </p>
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="recipe-text" className="text-base font-medium text-[#1A1A1A]">Recipe Text</Label>
          <Textarea
            id="recipe-text"
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            placeholder="Paste any recipe here! From a website, cookbook, handwritten note, or even that crumpled paper from grandma. I'll organize it beautifully! ✨"
            className="w-full h-40 p-4 border border-[#E3E3E3] rounded-[12px] resize-none text-base leading-relaxed focus:border-sage focus:ring-sage"
          />
        </div>
        
        <div className="flex justify-end pt-2">
          <Button
            onClick={onProcess}
            disabled={!recipeText.trim() || isProcessing}
            className="bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A] rounded-[12px] min-h-[44px] shadow-[0_1px_0_rgba(0,0,0,0.04)] font-medium"
          >
            {isProcessing ? "Processing..." : "Process Recipe"}
          </Button>
        </div>
      </div>
    </div>
  );
}
