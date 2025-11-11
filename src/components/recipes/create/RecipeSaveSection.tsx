
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { RecipeOrigin } from "./CreateRecipeContainer";

interface RecipeSaveSectionProps {
  wasGenerated: boolean;
  isComplete: boolean;
  isProcessing: boolean;
  onSave: () => void;
  onCancel: () => void;
  recipeOrigin: RecipeOrigin;
  isEditMode?: boolean;
}

export function RecipeSaveSection({
  wasGenerated,
  isComplete,
  isProcessing,
  onSave,
  onCancel,
  isEditMode = false,
}: RecipeSaveSectionProps) {
  if (!wasGenerated) return null;

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border">
      {/* Save/Cancel Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onSave}
          disabled={!isComplete || isProcessing}
          className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white h-11"
        >
          <Save className="h-4 w-4 mr-2" />
          {isEditMode ? "Update Recipe" : "Save Recipe"}
        </Button>
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 sm:flex-initial h-11"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
