
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Share, Trash2 } from "lucide-react";

interface MealPlannerActionsProps {
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  currentWeek: 1 | 2;
  setCurrentWeek: (week: 1 | 2) => void;
}

export const MealPlannerActions = ({ 
  onRandomize, 
  onShare,
  onClearAll,
  isLoading,
  currentWeek,
  setCurrentWeek
}: MealPlannerActionsProps) => {
  return (
    <div className="space-y-3">
      {/* Row 1: Week selector and Generate button */}
      <div className="flex gap-3 items-center">
        <div className="flex gap-2">
          {[1, 2].map((val) => (
            <Button
              key={val}
              size="sm"
              variant={currentWeek === val ? "default" : "outline"}
              className={currentWeek === val ? "bg-terracotta hover:bg-terracotta/90 text-white" : ""}
              onClick={() => setCurrentWeek(val as 1 | 2)}
              disabled={isLoading}
            >
              Week {val}
            </Button>
          ))}
        </div>
        
        <Button
          onClick={onRandomize}
          className="bg-sage hover:bg-sage/90 text-white flex items-center justify-center flex-1"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Generate Meal Plan
        </Button>
      </div>

      {/* Row 2: Share and Clear buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onShare}
          className="flex items-center gap-1 h-8 text-xs"
          disabled={isLoading}
        >
          <Share className="h-3 w-3" />
          Share
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onClearAll}
          className="flex items-center gap-1 h-8 text-xs"
          disabled={isLoading}
        >
          <Trash2 className="h-3 w-3" />
          Clear All
        </Button>
      </div>
    </div>
  );
};
