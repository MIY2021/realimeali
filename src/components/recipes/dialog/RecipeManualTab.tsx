
import { Pencil } from "lucide-react";

export function RecipeManualTab() {
  return (
    <div className="space-y-2">
      <div className="text-center py-8">
        <Pencil className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Manual Recipe Entry</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create a recipe from scratch with our easy-to-use form
        </p>
      </div>
    </div>
  );
}
