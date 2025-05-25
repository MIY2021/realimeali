
import { Button } from "@/components/ui/button";

interface CreateRecipeActionsProps {
  isMobile: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function CreateRecipeActions({ isMobile, onCancel, onSave }: CreateRecipeActionsProps) {
  return (
    <div className={`flex gap-3 mt-6 ${isMobile ? 'flex-col' : 'justify-end'}`}>
      <Button variant="outline" onClick={onCancel} className={isMobile ? "w-full" : ""}>
        Cancel
      </Button>
      <Button onClick={onSave} className={isMobile ? "w-full" : ""}>
        Create Recipe
      </Button>
    </div>
  );
}
