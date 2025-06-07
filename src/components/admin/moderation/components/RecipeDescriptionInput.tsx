
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Wand } from "lucide-react";

interface RecipeDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerateAI: () => void;
  isGeneratingAI: boolean;
}

export function RecipeDescriptionInput({ 
  value, 
  onChange, 
  onGenerateAI, 
  isGeneratingAI 
}: RecipeDescriptionInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">Description</Label>
        <Button
          onClick={onGenerateAI}
          disabled={isGeneratingAI}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {isGeneratingAI ? (
            <>
              <Loader className="h-3 w-3 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand className="h-3 w-3 mr-1" />
              Generate AI Description
            </>
          )}
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter recipe description"
        rows={3}
        className="w-full"
      />
    </div>
  );
}
