
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CreateRecipeActionsProps {
  isMobile: boolean;
  onCancel: () => void;
  onSave: () => void;
  showBackButton?: boolean;
}

export function CreateRecipeActions({ 
  isMobile, 
  onCancel, 
  onSave,
  showBackButton = false 
}: CreateRecipeActionsProps) {
  return (
    <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
      {showBackButton && (
        <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
      )}
      
      {!showBackButton && (
        <div className={`flex gap-3 ${isMobile ? 'w-full' : ''}`}>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className={isMobile ? 'flex-1' : ''}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            className={isMobile ? 'flex-1' : ''}
          >
            Save Recipe
          </Button>
        </div>
      )}
    </div>
  );
}
