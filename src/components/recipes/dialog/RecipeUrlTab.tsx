
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RecipeUrlTabProps {
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
}

export function RecipeUrlTab({ websiteUrl, setWebsiteUrl }: RecipeUrlTabProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md mb-3">
        <span>I'll automatically extract the title, ingredients, cooking steps, and even suggest helpful categories!</span>
      </div>
      <Label htmlFor="website-url">Recipe Website URL</Label>
      <Input
        id="website-url"
        type="url"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        placeholder="https://www.allrecipes.com/recipe/231506/simple-macaroni-and-cheese/"
      />
      <p className="text-xs text-muted-foreground">
        I can extract recipes directly from recipe websites and find images too! Just paste the URL from sites like AllRecipes, Food Network, BBC Good Food, etc.
      </p>
    </div>
  );
}
