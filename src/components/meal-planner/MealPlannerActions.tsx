
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Share, Trash2 } from "lucide-react";
import { MealPlannerLayoutSelector } from "./MealPlannerLayoutSelector";

interface MealPlannerActionsProps {
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  currentWeek: 1 | 2;
  setCurrentWeek: (week: 1 | 2) => void;
  mostRecentWeek: 1 | 2 | null;
  mealLayout: string;
  onMealLayoutChange: (value: string) => void;
}

export const MealPlannerActions = ({ 
  onRandomize, 
  onShare,
  onClearAll,
  isLoading,
  currentWeek,
  setCurrentWeek,
  mostRecentWeek,
  mealLayout,
  onMealLayoutChange
}: MealPlannerActionsProps) => {
  return (
    <div className="space-y-2 pb-3">
      {/* Row 1: Week selector and Generate button */}
      <div className="flex gap-2 items-center">
        <div className="flex gap-2">
          {[1, 2].map((val) => (
            <Button
              key={val}
              size="sm"
              variant={currentWeek === val ? "default" : "outline"}
              className={`h-9 px-4 font-semibold rounded-lg shadow-sm ${
                currentWeek === val 
                  ? "bg-butter text-navy hover:bg-butter/90 border-0" 
                  : "bg-white text-navy border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setCurrentWeek(val as 1 | 2)}
              disabled={isLoading}
            >
              Week {val}
            </Button>
          ))}
        </div>
        
        <Button
          onClick={onRandomize}
          className="bg-sage-muted hover:bg-sage-muted/90 text-navy flex items-center justify-center flex-1 h-9 font-semibold rounded-lg shadow-sm"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </div>

      {/* Row 2: Share, Clear, and Layout buttons */}
      <div className="flex gap-2 items-center">
        <Button
          size="sm"
          onClick={onShare}
          className="flex items-center gap-2 h-9 px-3 rounded-lg font-medium"
          style={{ 
            backgroundColor: 'hsl(var(--muted))',
            color: '#232D3F'
          }}
        >
          <Share className="h-4 w-4" />
          <span className="text-sm">Share</span>
        </Button>
        
        <Button
          size="sm"
          onClick={onClearAll}
          className="flex items-center gap-2 h-9 px-3 rounded-lg font-medium"
          style={{ 
            backgroundColor: 'hsl(var(--muted))',
            color: '#232D3F'
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm">Clear All</span>
        </Button>

        <div className="flex-1" />

        <MealPlannerLayoutSelector
          value={mealLayout}
          onChange={onMealLayoutChange}
        />
      </div>
    </div>
  );
};
