
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

interface CreateRecipeHeaderProps {
  onCancel: () => void;
}

export function CreateRecipeHeader({ onCancel }: CreateRecipeHeaderProps) {
  return (
    <div className="mb-6">
      {/* Mobile: Stack vertically with back button above title */}
      <div className="block md:hidden space-y-4">
        <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2 p-0">
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Add New Recipe
          </h1>
          <p className="text-muted-foreground">Create a new recipe for your household</p>
        </div>
      </div>

      {/* Desktop: Keep horizontal layout */}
      <div className="hidden md:flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Add New Recipe
          </h1>
          <p className="text-muted-foreground">Create a new recipe for your household</p>
        </div>
      </div>
    </div>
  );
}
