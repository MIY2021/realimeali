
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Share, Trash2 } from "lucide-react";

interface MealPlannerActionsProps {
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  currentWeek: 1 | 2;
}

export const MealPlannerActions = ({ 
  onRandomize, 
  onShare,
  onClearAll,
  isLoading
}: MealPlannerActionsProps) => {
  return (
    <div className="space-y-2">
      {/* Mobile: All buttons on one row */}
      <div className="flex gap-3 sm:hidden">
        <Button
          onClick={onRandomize}
          className="bg-sage hover:bg-sage/90 text-white flex items-center justify-center flex-1"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Generate Meal Plan
        </Button>
        
        <Button
          onClick={onShare}
          variant="outline"
          className="flex items-center justify-center min-w-[44px] px-3"
          disabled={isLoading}
          title="Share"
        >
          <Share className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          className="text-terracotta border-terracotta hover:bg-terracotta/10 flex items-center justify-center min-w-[44px] px-3"
          onClick={onClearAll}
          disabled={isLoading}
          title="Clear All"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: Generate button narrower, Share and Clear on the right */}
      <div className="hidden sm:flex gap-3 justify-between">
        <Button
          onClick={onRandomize}
          className="bg-sage hover:bg-sage/90 text-white flex items-center justify-center px-6"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Generate Meal Plan
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={onShare}
            variant="outline"
            className="flex items-center"
            disabled={isLoading}
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button
            variant="outline"
            className="text-terracotta border-terracotta hover:bg-terracotta/10 flex items-center"
            onClick={onClearAll}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};
