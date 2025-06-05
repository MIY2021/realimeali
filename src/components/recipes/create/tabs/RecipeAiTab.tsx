
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

interface RecipeAiTabProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  stylePreferences: string[];
  setStylePreferences: (preferences: string[]) => void;
  onGenerateRecipe: () => void;
  isGenerating: boolean;
  generationProgress: string;
}

const STYLE_OPTIONS = [
  {
    id: 'quick-easy',
    label: '🚀 Quick & Easy',
    description: 'Minimal prep time and simple techniques'
  },
  {
    id: 'cheap-cheerful',
    label: '💰 Cheap & Cheerful',
    description: 'Budget-friendly ingredients and methods'
  },
  {
    id: 'michelin-star',
    label: '⭐ Michelin Star',
    description: 'Restaurant-quality techniques and presentation'
  }
];

export function RecipeAiTab({
  aiPrompt,
  setAiPrompt,
  stylePreferences,
  setStylePreferences,
  onGenerateRecipe,
  isGenerating,
  generationProgress
}: RecipeAiTabProps) {
  const handleStyleChange = (styleId: string, checked: boolean) => {
    if (checked) {
      setStylePreferences([...stylePreferences, styleId]);
    } else {
      setStylePreferences(stylePreferences.filter(s => s !== styleId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-4 rounded-lg">
          🤖 Describe what kind of recipe you want and I'll create it for you! Include details like cuisine type, dietary preferences, cooking method, or specific ingredients you want to use.
        </div>
        <div className="sm:hidden bg-blue-50 p-3 rounded-lg">
          🤖 Describe what you want and I'll create a custom recipe for you!
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="ai-prompt" className="text-base font-medium">Recipe Request</Label>
        <Textarea
          id="ai-prompt"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g., 'Create a healthy Mediterranean pasta dish with vegetables and feta cheese'"
          className="min-h-[120px] text-base p-4"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Style Preferences (optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STYLE_OPTIONS.map((style) => (
            <div
              key={style.id}
              onClick={() => handleStyleChange(style.id, !stylePreferences.includes(style.id))}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                stylePreferences.includes(style.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={style.id}
                  checked={stylePreferences.includes(style.id)}
                  onChange={() => {}} // Handled by div click
                />
                <Label htmlFor={style.id} className="font-medium cursor-pointer">
                  {style.label}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {style.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isGenerating && generationProgress && (
        <div className="space-y-3">
          <div className="text-sm text-blue-600 font-medium">
            {generationProgress}
          </div>
          <Progress value={50} className="w-full" />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={onGenerateRecipe}
          disabled={!aiPrompt.trim() || isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? "Generating..." : "Generate Recipe"}
        </Button>
      </div>
    </div>
  );
}
