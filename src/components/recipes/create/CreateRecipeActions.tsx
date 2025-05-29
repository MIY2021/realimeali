
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CreateRecipeActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  isValid?: boolean;
  shareWithCommunity?: boolean;
  setShareWithCommunity?: (value: boolean) => void;
  wasImportedFromWebsite?: boolean;
}

export function CreateRecipeActions({ 
  onCancel, 
  onSave,
  isSaving = false,
  isValid = true,
  shareWithCommunity = false,
  setShareWithCommunity,
  wasImportedFromWebsite = false
}: CreateRecipeActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <Button 
        variant="ghost" 
        onClick={onCancel} 
        className="flex items-center gap-2"
        disabled={isSaving}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Button>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSave}
          disabled={isSaving || !isValid}
        >
          {isSaving ? "Saving..." : "Save Recipe"}
        </Button>
      </div>
    </div>
  );
}
