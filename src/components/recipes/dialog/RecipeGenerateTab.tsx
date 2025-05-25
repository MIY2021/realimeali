
import { Label } from "@/components/ui/label";

interface RecipeGenerateTabProps {
  recipeRequest: string;
  setRecipeRequest: (request: string) => void;
}

export function RecipeGenerateTab({ recipeRequest, setRecipeRequest }: RecipeGenerateTabProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg mb-4">
        <span>🤖 I'll create a custom recipe with title, ingredients, cooking steps, and helpful categories just for you!</span>
      </div>
      <Label htmlFor="recipe-request" className="text-base font-medium">What recipe would you like me to create?</Label>
      <textarea
        id="recipe-request"
        value={recipeRequest}
        onChange={(e) => setRecipeRequest(e.target.value)}
        placeholder="Tell me what you're craving! E.g., 'A quick vegetarian dinner for 4 people using ingredients I might have at home' or 'A fancy dessert for a dinner party' or 'Healthy breakfast ideas with oats'."
        className="w-full h-40 p-4 border rounded-lg resize-none text-base leading-relaxed"
      />
      <p className="text-sm text-muted-foreground">
        I'll create a custom recipe based on your needs! Be as specific as you want about ingredients, dietary needs, cooking time, etc. I can even recreate dishes from restaurants you loved!
      </p>
    </div>
  );
}
