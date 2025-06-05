
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

interface RecipeGenerateTabProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  stylePreferences: string[];
  setStylePreferences: (preferences: string[]) => void;
  isProcessing: boolean;
  generationProgress: string;
  progressValue: number;
  onGenerate: () => void;
}

const styleOptions = [
  { id: 'quick-easy', label: '🚀 Quick & Easy', description: 'Minimal prep time and simple techniques' },
  { id: 'cheap-cheerful', label: '💰 Budget-Friendly', description: 'Cost-effective ingredients and methods' },
  { id: 'michelin-star', label: '⭐ Michelin Star', description: 'Elevated techniques and presentation' },
];

export function RecipeGenerateTab({ 
  aiPrompt, 
  setAiPrompt, 
  stylePreferences, 
  setStylePreferences, 
  isProcessing,
  generationProgress,
  progressValue,
  onGenerate 
}: RecipeGenerateTabProps) {
  const toggleStyle = (styleId: string) => {
    setStylePreferences(
      stylePreferences.includes(styleId)
        ? stylePreferences.filter(id => id !== styleId)
        : [...stylePreferences, styleId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Helper text - left aligned, reduced padding */}
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-3 rounded-lg">
          I'll create a custom recipe based on your needs! Be as specific as you want about ingredients, dietary needs, cooking time, etc.
        </div>
        <div className="sm:hidden">
          I'll create a custom recipe based on your needs! Be as specific as you want about ingredients, dietary needs, cooking time, etc.
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="recipe-request" className="text-base font-medium">What recipe would you like me to create?</Label>
        <Textarea
          id="recipe-request"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Tell me what you're craving! E.g., 'A quick vegetarian dinner for 4 people using ingredients I might have at home' or 'A fancy dessert for a dinner party' or 'Healthy breakfast ideas with oats'."
          className="w-full h-40 p-4 border rounded-lg resize-none text-base leading-relaxed"
        />
        
        <div className="space-y-3">
          <Label className="text-base font-medium">Style Preferences (Optional)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {styleOptions.map((style) => (
              <div
                key={style.id}
                onClick={() => toggleStyle(style.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  stylePreferences.includes(style.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{style.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{style.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress display - identical to image import */}
      {isProcessing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Generating recipe...</span>
            <span className="text-muted-foreground">{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="w-full" />
          {generationProgress && (
            <p className="text-sm text-blue-600 font-medium">
              {generationProgress}
            </p>
          )}
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          onClick={onGenerate}
          disabled={!aiPrompt.trim() || isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              {generationProgress || "Generating..."}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Recipe
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
