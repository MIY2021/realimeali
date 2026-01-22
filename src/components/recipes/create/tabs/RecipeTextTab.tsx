
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
        <div>
          <Label htmlFor="recipe-text" className="text-base font-medium text-[#1A1A1A] block text-center">Recipe Text</Label>
          <Textarea
            id="recipe-text"
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            placeholder="Paste your recipe here from any source"
            className="w-full h-40 p-4 border border-[#E3E3E3] rounded-[12px] resize-none text-sm leading-relaxed focus:border-sage focus:ring-sage mt-2 placeholder:text-sm"
          />
        </div>
        
        <div className="flex justify-center pt-2">
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
