
import { Label } from "@/components/ui/label";

interface RecipeTextTabProps {
  recipeText: string;
  setRecipeText: (text: string) => void;
}

export function RecipeTextTab({ recipeText, setRecipeText }: RecipeTextTabProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg mb-4">
        <span>✨ I'll automatically organize the title, ingredients, cooking steps, and suggest helpful categories!</span>
      </div>
      <Label htmlFor="recipe-text" className="text-base font-medium">Recipe Text</Label>
      <textarea
        id="recipe-text"
        value={recipeText}
        onChange={(e) => setRecipeText(e.target.value)}
        placeholder="Paste any recipe here! From a website, cookbook, handwritten note, or even that crumpled paper from grandma. I'll organize it beautifully! ✨"
        className="w-full h-40 p-4 border rounded-lg resize-none text-base leading-relaxed"
      />
    </div>
  );
}
