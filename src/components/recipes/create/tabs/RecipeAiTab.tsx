
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
  "rustic and homemade",
  "elegant and refined", 
  "colorful and vibrant",
  "minimalist and clean",
  "traditional and classic"
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
  const handleStyleChange = (style: string, checked: boolean) => {
    if (checked) {
      setStylePreferences([...stylePreferences, style]);
    } else {
      setStylePreferences(stylePreferences.filter(s => s !== style));
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <div className="hidden sm:block bg-blue-50 p-3 rounded-lg">
          🤖 Describe what kind of recipe you want and I'll create it for you! Include details like cuisine type, dietary preferences, cooking method, or specific ingredients you want to use.
        </div>
        <div className="sm:hidden">
          🤖 Describe what kind of recipe you want and I'll create it for you! Include details like cuisine type, dietary preferences, cooking method, or specific ingredients you want to use.
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="ai-prompt" className="text-base font-medium">Recipe Request</Label>
        <Textarea
          id="ai-prompt"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g., 'Create a healthy Mediterranean pasta dish with vegetables and feta cheese'"
          className="min-h-[100px] text-base p-4"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">Style Preferences (optional)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STYLE_OPTIONS.map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <Checkbox
                id={style}
                checked={stylePreferences.includes(style)}
                onCheckedChange={(checked) => handleStyleChange(style, checked as boolean)}
              />
              <Label htmlFor={style} className="text-sm capitalize">
                {style}
              </Label>
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
