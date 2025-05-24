
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

interface RecipeAmendmentProps {
  amendmentRequest: string;
  setAmendmentRequest: (request: string) => void;
  onAmendRecipe: () => void;
  isAmending: boolean;
  activeTab: string;
}

export function RecipeAmendment({
  amendmentRequest,
  setAmendmentRequest,
  onAmendRecipe,
  isAmending,
  activeTab
}: RecipeAmendmentProps) {
  if (activeTab !== "generate") return null;

  return (
    <div className="bg-blue-50 p-3 rounded-md space-y-2">
      <Label htmlFor="amendment-request">Want to make changes to this recipe?</Label>
      <div className="flex gap-2">
        <textarea
          id="amendment-request"
          value={amendmentRequest}
          onChange={(e) => setAmendmentRequest(e.target.value)}
          placeholder="E.g., 'Make it spicier', 'Add more vegetables', 'Make it vegan', 'Reduce cooking time'..."
          className="flex-1 h-20 p-2 border rounded-md resize-none text-sm"
        />
        <Button
          onClick={onAmendRecipe}
          disabled={isAmending || !amendmentRequest.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAmending ? (
            <>
              <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-white border-t-transparent" />
              Updating...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              Update
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
