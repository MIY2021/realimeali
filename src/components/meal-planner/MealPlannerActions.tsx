import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share, Trash2, Sparkles, Loader } from "lucide-react";
import { WeekSelector } from "@/components/shared/WeekSelector";
import { AllWeeksModal } from "@/components/shared/AllWeeksModal";
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
  allMealPlans?: MealPlan[]; // For AllWeeksModal
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
  allMealPlans = []
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
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline">Generate Meal Plan</span>
              <span className="sm:hidden">Generate</span>
            </>
          )}
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
      <AllWeeksModal
        open={allWeeksModalOpen}
        onOpenChange={setAllWeeksModalOpen}
        currentWeek={currentWeek}
        onWeekSelect={setCurrentWeek}
        mealPlans={allMealPlans}
      />
    </>
  );
};
