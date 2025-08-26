
import { Label } from "@/components/ui/label";

interface RecipeFormHeaderProps {
  recipeId: string;
  recipeTitle: string;
}

export function RecipeFormHeader({ recipeId, recipeTitle }: RecipeFormHeaderProps) {
  return (
    <div className="text-sm text-muted-foreground mb-4">
      Editing: {recipeTitle} (ID: {recipeId.slice(0, 8)}...)
    </div>
  );
}
