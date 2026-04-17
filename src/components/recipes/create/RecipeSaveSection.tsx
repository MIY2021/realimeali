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
  isSaving?: boolean;
}

export function RecipeSaveSection({
  wasGenerated,
  isComplete,
  isProcessing,
  onSave,
  onCancel,
  isEditMode = false,
  isSaving = false,
}: RecipeSaveSectionProps) {
  // Always show save section on manual tab, not just when wasGenerated
  // The button will be disabled if not complete

  const isDisabled = !isComplete || isProcessing || isSaving;

  // Debug logging
  if (!isComplete) {
    console.log('⚠️ Save button disabled - recipe not complete:', {
      isComplete,
      isProcessing,
      isSaving,
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border">
      {/* Save/Cancel Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onSave}
          disabled={isDisabled}
          className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEditMode ? "Updating..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? "Update Recipe" : "Save Recipe"}
            </>
          )}
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
