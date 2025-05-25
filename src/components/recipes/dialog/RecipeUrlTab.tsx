
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RecipeUrlTabProps {
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
}

export function RecipeUrlTab({ websiteUrl, setWebsiteUrl }: RecipeUrlTabProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg mb-4">
        <span>🔗 I'll automatically grab the recipe details and even find the photos for you!</span>
      </div>
      <Label htmlFor="website-url" className="text-base font-medium">Recipe Website URL</Label>
      <Input
        id="website-url"
        type="url"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        placeholder="https://www.allrecipes.com/recipe/231506/simple-macaroni-and-cheese/"
        className="text-base p-4 h-12"
      />
      <p className="text-sm text-muted-foreground">
        I can grab recipes directly from popular cooking websites like AllRecipes, Food Network, BBC Good Food, and many more!
      </p>
    </div>
  );
}
