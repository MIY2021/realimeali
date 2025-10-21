
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Star } from "lucide-react";

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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[12px] border border-[#E3E3E3] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Star className="h-10 w-10 text-sage" />
            <Sparkles className="h-7 w-7 text-yellow-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A]">Generate with AI</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mx-auto">
            Describe what you want to cook and let AI create a complete recipe
          </p>
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="recipe-request" className="text-base font-medium text-[#1A1A1A]">What recipe would you like me to create?</Label>
          <Textarea
            id="recipe-request"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Tell me what you're craving! E.g., 'A quick vegetarian dinner for 4 people using ingredients I might have at home' or 'A fancy dessert for a dinner party' or 'Healthy breakfast ideas with oats'."
            className="w-full h-40 p-4 border border-[#E3E3E3] rounded-[12px] resize-none text-base leading-relaxed focus:border-sage focus:ring-sage"
          />
          
          <div className="space-y-4">
            <Label className="text-base font-medium text-[#1A1A1A]">Style Preferences (Optional)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {styleOptions.map((style) => (
                <div
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`p-4 border rounded-[12px] cursor-pointer transition-all ${
                    stylePreferences.includes(style.id)
                      ? 'border-sage bg-[#CFE6D6]/20 shadow-sm'
                      : 'border-[#E3E3E3] hover:border-[#B8D9C5]'
                  }`}
                >
                  <div className="font-medium text-sm text-[#1A1A1A]">{style.label}</div>
                  <div className="text-xs text-[#6B6B6B] mt-1">{style.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress display */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Processing recipe...</span>
              <span className="text-sm text-[#6B6B6B]">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="w-full" />
            {generationProgress && (
              <p className="text-sm text-sage font-medium">{generationProgress}</p>
            )}
          </div>
        )}
        
        <div className="flex justify-end pt-2">
          <Button
            onClick={onGenerate}
            disabled={!aiPrompt.trim() || isProcessing}
            className="bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A] rounded-[12px] min-h-[44px] shadow-[0_1px_0_rgba(0,0,0,0.04)] font-medium"
          >
            {isProcessing ? "Generating..." : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Recipe
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
