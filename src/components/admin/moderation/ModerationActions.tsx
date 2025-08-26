
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

interface ModerationActionsProps {
  recipe: CommunityRecipe;
  onApprove: (recipeId: string) => void;
  onReject: (recipeId: string) => void;
}

export function ModerationActions({
  recipe,
  onApprove,
  onReject,
}: ModerationActionsProps) {
  const canApprove = recipe.ai_generated_image_url;
  
  const handleApprove = () => {
    onApprove(recipe.id);
  };

  const handleReject = () => {
    onReject(recipe.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Moderation Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Requirements Check */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {recipe.ai_generated_image_url ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span>Image Available</span>
          </div>
        </div>

        {!canApprove && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-amber-600 font-semibold text-sm">⚠</span>
            <div className="text-sm text-amber-800">
              Recipe requires an image before it can be approved.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleApprove}
            disabled={!canApprove}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Check className="h-4 w-4 mr-2" />
            Approve Recipe
          </Button>

          <Button
            onClick={handleReject}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <X className="h-4 w-4 mr-2" />
            Reject Recipe
          </Button>
        </div>

        {/* Quick Actions Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p><strong>Keyboard shortcuts:</strong></p>
          <p>A = Approve • R = Reject • ← → = Navigate</p>
        </div>
      </CardContent>
    </Card>
  );
}
