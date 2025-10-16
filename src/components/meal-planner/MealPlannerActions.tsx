import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Share, Trash2, Loader } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { HeaderControls } from "@/components/layout/HeaderControls";
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
    <HeaderControls
      weekControl={
        <SegmentedControl 
          value={currentWeek} 
          onChange={setCurrentWeek} 
          disabled={isLoading}
        />
      }
      primaryAction={
        <Button 
          variant="primary" 
          size="md" 
          onClick={onRandomize} 
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-5 h-5" />
          )}
          Generate
        </Button>
      }
      utilityActions={
        <>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onShare}
          >
            <Share className="w-4 h-4" />
            Share
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onClearAll}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </>
      }
      layoutToggle={
        <MealPlannerLayoutSelector
          value={mealLayout}
          onChange={onMealLayoutChange}
        />
      }
    />
  );
};
