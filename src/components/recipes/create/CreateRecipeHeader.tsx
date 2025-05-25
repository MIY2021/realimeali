
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CreateRecipeHeaderProps {
  onCancel: () => void;
}

export function CreateRecipeHeader({ onCancel }: CreateRecipeHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-navy">Add New Recipe</h1>
        <p className="text-muted-foreground">Create a new recipe for your household</p>
      </div>
    </div>
  );
}
