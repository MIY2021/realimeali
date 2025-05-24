
import { Label } from "@/components/ui/label";

interface RecipeTextTabProps {
  recipeText: string;
  setRecipeText: (text: string) => void;
}

export function RecipeTextTab({ recipeText, setRecipeText }: RecipeTextTabProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md mb-3">
        <span>I'll automatically extract the title, ingredients, cooking steps, and even suggest helpful categories!</span>
      </div>
      <Label htmlFor="recipe-text">Recipe Text</Label>
      <textarea
        id="recipe-text"
        value={recipeText}
        onChange={(e) => setRecipeText(e.target.value)}
        placeholder="Paste any recipe here! From a website, cookbook, handwritten note, or even that crumpled paper from grandma. I'll organise it beautifully! ✨"
        className="w-full h-32 p-3 border rounded-md resize-none"
      />
    </div>
  );
}
