
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sparkles, CircleDollarSign, Crown } from "lucide-react";

interface RecipeGenerateTabProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  isProcessing: boolean;
  onGenerate: () => void;
  stylePreferences: string[];
  setStylePreferences: (preferences: string[]) => void;
}

export function RecipeGenerateTab({ 
  aiPrompt, 
  setAiPrompt, 
  isProcessing, 
  onGenerate,
  stylePreferences,
  setStylePreferences
}: RecipeGenerateTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Describe Your Recipe</label>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Tell us what kind of recipe you want to create - ingredients you have, cuisine type, dietary requirements, etc..."
          className="w-full h-24 sm:h-32 p-3 sm:p-4 border rounded-lg resize-none text-sm sm:text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Recipe Style</label>
        <ToggleGroup 
          type="multiple" 
          value={stylePreferences}
          onValueChange={setStylePreferences}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full"
        >
          <ToggleGroupItem 
            value="quick-easy" 
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent"
          >
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Quick & Easy</span>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="cheap-cheerful" 
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent"
          >
            <CircleDollarSign className="h-4 w-4" />
            <span className="font-medium">Cheap & Cheerful</span>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="michelin-star" 
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent"
          >
            <Crown className="h-4 w-4" />
            <span className="font-medium">Michelin Star</span>
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-xs text-muted-foreground mt-2">
          Select one or more styles to customize your recipe generation
        </p>
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
