
import { Button } from "@/components/ui/button";

interface RecipeGenerateTabProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  isProcessing: boolean;
  onGenerate: () => void;
}

export function RecipeGenerateTab({ 
  aiPrompt, 
  setAiPrompt, 
  isProcessing, 
  onGenerate 
}: RecipeGenerateTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Describe Your Recipe</label>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Tell us what kind of recipe you want to create - ingredients you have, cuisine type, dietary requirements, etc..."
          className="w-full h-24 sm:h-32 p-3 sm:p-4 border rounded-lg resize-none text-sm sm:text-base"
        />
      </div>
      <Button 
        onClick={onGenerate} 
        disabled={isProcessing || !aiPrompt.trim()}
        className="w-full h-11 sm:h-10"
      >
        {isProcessing ? "Generating..." : "Create Recipe with AI"}
      </Button>
    </div>
  );
}
