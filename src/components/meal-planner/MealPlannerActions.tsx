import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Trash2, Sparkles, Loader } from "lucide-react";
import { WeekSelector } from "@/components/shared/WeekSelector";
import { CalendarMonthModal } from "@/components/shared/CalendarMonthModal";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { MealPlannerLayoutSelector } from "./MealPlannerLayoutSelector";
import { MealPlan } from "@/types";

interface MealPlannerActionsProps {
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  currentWeek: string; // ISO week key
  setCurrentWeek: (week: string) => void;
  mealLayout: string;
  onMealLayoutChange: (value: string) => void;
  allMealPlans?: MealPlan[]; // For CalendarMonthModal
  copyWeek?: (sourceWeekKey: string, targetWeekKey: string) => Promise<void>;
}

export const MealPlannerActions = ({ 
  onRandomize, 
  onShare,
  onClearAll,
  isLoading,
  currentWeek,
  setCurrentWeek,
  mealLayout,
  onMealLayoutChange,
  allMealPlans = [],
  copyWeek
}: MealPlannerActionsProps) => {
  const [allWeeksModalOpen, setAllWeeksModalOpen] = useState(false);

  return (
    <>
    <HeaderControls
      weekControl={
          <WeekSelector 
            currentWeek={currentWeek} 
            onWeekChange={setCurrentWeek}
            onWeekClick={() => setAllWeeksModalOpen(true)}
            isLoading={isLoading}
        />
      }
      utilityActions={
        <>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onRandomize} 
            disabled={isLoading}
            aria-busy={isLoading}
            className="h-9 px-3"
            title="Generate Meal Plan"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="ml-2">Generate</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="ml-2">Generate</span>
              </>
            )}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onShare}
            className="h-9 w-9 p-0"
            title="Share"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onClearAll}
            className="h-9 w-9 p-0"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
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
      <CalendarMonthModal
        open={allWeeksModalOpen}
        onOpenChange={setAllWeeksModalOpen}
        currentWeek={currentWeek}
        onWeekSelect={setCurrentWeek}
        mealPlans={allMealPlans}
        onCopyWeek={copyWeek}
      />
    </>
  );
};
