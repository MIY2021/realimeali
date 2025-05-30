
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Users } from "lucide-react";

interface RecipeSaveSectionProps {
  wasGenerated: boolean;
  shareWithCommunity: boolean;
  setShareWithCommunity: (value: boolean) => void;
  isComplete: boolean;
  isProcessing: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function RecipeSaveSection({
  wasGenerated,
  shareWithCommunity,
  setShareWithCommunity,
  isComplete,
  isProcessing,
  onSave,
  onCancel,
}: RecipeSaveSectionProps) {
  if (!wasGenerated) return null;

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border">
      {/* Community Sharing Checkbox - Show for all generated recipes */}
      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <Checkbox
          id="shareWithCommunity"
          checked={shareWithCommunity}
          onCheckedChange={setShareWithCommunity}
          className="mt-0.5"
        />
        <div className="flex-1">
          <label 
            htmlFor="shareWithCommunity" 
            className="text-sm font-medium text-green-800 cursor-pointer flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            🎉 Share with RealiMeali Community
          </label>
          <p className="text-xs text-green-700 mt-1">
            Help other users discover this recipe! It will appear in the "Find Recipes" section after our moderation team approves it.
            Only the recipe link and details are shared - the full recipe stays on the original website.
          </p>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onSave}
          disabled={!isComplete || isProcessing}
          className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white h-11"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Recipe
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
