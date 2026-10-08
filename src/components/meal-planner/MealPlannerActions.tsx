import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Trash2, Sparkles, Loader, MoreHorizontal } from "lucide-react";
import { WeekSelector } from "@/components/shared/WeekSelector";
import { CalendarMonthModal } from "@/components/shared/CalendarMonthModal";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { PageControlsCard } from "@/components/layout/PageControlsCard";
import { MealPlan } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MealPlannerActionsProps {
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  currentWeek: string;
  setCurrentWeek: (week: string) => void;
  mealLayout: string;
  onMealLayoutChange: (value: string) => void;
  allMealPlans?: MealPlan[];
  copyWeek?: (sourceWeekKey: string, targetWeekKey: string) => Promise<void>;
}

export const MealPlannerActions = ({
  onRandomize,
  onShare,
  onClearAll,
  isLoading,
  currentWeek,
  setCurrentWeek,
  allMealPlans = [],
  copyWeek,
}: MealPlannerActionsProps) => {
  const [allWeeksModalOpen, setAllWeeksModalOpen] = useState(false);

  return (
    <>
      <PageControlsCard>
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
                className="h-9 rounded-full px-4"
                title="Generate Meal Plan"
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-2">{isLoading ? "Generating…" : "Surprise me"}</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={onShare}
                disabled={isLoading}
                className="h-9 w-9 rounded-full p-0"
                title="Share meal plan"
                aria-label="Share meal plan"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 w-9 rounded-full p-0"
                    aria-label="More meal planner options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onClearAll} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear week
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />
      </PageControlsCard>

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
