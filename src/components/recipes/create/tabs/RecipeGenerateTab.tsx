
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RecipeGenerateTabProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  stylePreferences: any;
  setStylePreferences: (prefs: any) => void;
  isProcessing: boolean;
  onGenerate: () => void;
}

export function RecipeGenerateTab({
  aiPrompt,
  setAiPrompt,
  stylePreferences,
  setStylePreferences,
  isProcessing,
  onGenerate
}: RecipeGenerateTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Describe what you want to cook
        </label>
        <Textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="I want to make a healthy pasta dish with vegetables..."
          className="min-h-[120px]"
        />
      </div>
      
      <Button
        onClick={onGenerate}
        disabled={isProcessing || !aiPrompt.trim()}
        className="w-full"
      >
        {isProcessing ? "Generating..." : "Generate Recipe"}
      </Button>
    </div>
  );
}
