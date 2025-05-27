
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CreateRecipeHeaderProps {
  onCancel: () => void;
  showBackButton?: boolean;
}

export function CreateRecipeHeader({ onCancel, showBackButton = false }: CreateRecipeHeaderProps) {
  if (!showBackButton) {
    return null;
  }

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Button>
    </div>
  );
}
