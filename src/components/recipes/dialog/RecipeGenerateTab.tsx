
import { Label } from "@/components/ui/label";

interface RecipeGenerateTabProps {
  recipeRequest: string;
  setRecipeRequest: (request: string) => void;
}

export function RecipeGenerateTab({ recipeRequest, setRecipeRequest }: RecipeGenerateTabProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md mb-3">
        <span>I'll automatically create the title, ingredients, cooking steps, and even suggest helpful categories!</span>
      </div>
      <Label htmlFor="recipe-request">What recipe do you need?</Label>
      <textarea
        id="recipe-request"
        value={recipeRequest}
        onChange={(e) => setRecipeRequest(e.target.value)}
        placeholder="Tell me what you're looking for! E.g., 'A quick vegetarian dinner for 4 people using ingredients I might have at home' or 'A fancy dessert for a dinner party' or 'Healthy breakfast ideas with oats'."
        className="w-full h-32 p-3 border rounded-md resize-none"
      />
      <p className="text-xs text-muted-foreground">
        I'll create a custom recipe based on your needs! Be as specific as you want about ingredients, dietary restrictions, cooking time, etc. You can also ask me to reverse engineer recipes from restaurants that you liked!
      </p>
    </div>
  );
}
