import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  parseISOWeekKey, 
  formatWeekRangeWithoutYear,
  getCurrentWeekKey,
  isCurrentWeek,
  getWeekStartDate,
  getWeekEndDate,
  getISOWeekKey,
  getPreviousWeek,
  getNextWeek
} from "@/utils/weekUtils";
import { Copy, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { MealPlan } from "@/types";
import { cn } from "@/lib/utils";

interface CalendarMonthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWeek: string; // ISO week key
  onWeekSelect: (week: string) => void;
  mealPlans: MealPlan[]; // All meal plans to group by week
  onCopyWeek?: (sourceWeek: string, targetWeek: string) => Promise<void>;
}

interface WeekBlock {
  weekKey: string;
  year: number;
  week: number;
  mealCount: number;
  startDate: Date;
  endDate: Date;
}

export function CalendarMonthModal({
  open,
  onOpenChange,
  currentWeek,
  onWeekSelect,
  mealPlans,
  onCopyWeek,
}: CalendarMonthModalProps) {
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const { year } = parseISOWeekKey(currentWeek);
    return year;
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const { year, week } = parseISOWeekKey(currentWeek);
    const startDate = getWeekStartDate(year, week);
    return startDate.getMonth();
  });
  const [copyingFromWeek, setCopyingFromWeek] = useState<string | null>(null);

  // Group meal plans by week
  const weekMap = useMemo(() => {
    const map = new Map<string, number>();
    mealPlans.forEach((plan) => {
      const weekKey = plan.week_key || getISOWeekKey(new Date(plan.date));
      map.set(weekKey, (map.get(weekKey) || 0) + 1);
    });
    return map;
  }, [mealPlans]);

  // Get all weeks for the selected month
  const monthWeeks = useMemo(() => {
    const weeks: WeekBlock[] = [];
    const year = selectedYear;
    const month = selectedMonth;
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Find the Monday of the week containing the first day
    const firstDayOfWeek = firstDay.getDay();
    const daysToMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const startDate = new Date(year, month, 1 - daysToMonday);
    
    // Find the Sunday of the week containing the last day
    const lastDayOfWeek = lastDay.getDay();
    const daysToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    const endDate = new Date(year, month + 1, 0 + daysToSunday);
    
    // Generate all weeks that overlap with this month
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const weekKey = getISOWeekKey(currentDate);
      const { year: weekYear, week } = parseISOWeekKey(weekKey);
      const weekStart = getWeekStartDate(weekYear, week);
      const weekEnd = getWeekEndDate(weekYear, week);
      const mealCount = weekMap.get(weekKey) || 0;
      
      // Only include weeks that actually overlap with the selected month
      const weekStartMonth = weekStart.getMonth();
      const weekStartYear = weekStart.getFullYear();
      const weekEndMonth = weekEnd.getMonth();
      const weekEndYear = weekEnd.getFullYear();
      
      const overlaps = (weekStartMonth === month && weekStartYear === year) ||
                      (weekEndMonth === month && weekEndYear === year) ||
                      (weekStartMonth < month && weekEndMonth > month && weekStartYear === year) ||
                      (weekStartYear < year && weekEndYear === year) ||
                      (weekStartYear === year && weekEndYear > year);
      
      if (overlaps) {
        weeks.push({
          weekKey,
          year: weekYear,
          week,
          mealCount,
          startDate: weekStart,
          endDate: weekEnd,
        });
      }
      
      // Move to next week (add 7 days)
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return weeks;
  }, [selectedYear, selectedMonth, weekMap]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    mealPlans.forEach((plan) => {
      const weekKey = plan.week_key || getISOWeekKey(new Date(plan.date));
      try {
        const { year } = parseISOWeekKey(weekKey);
        years.add(year);
      } catch (e) {
        // Ignore invalid week keys
      }
    });
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    years.add(currentYear + 1);
    return Array.from(years).sort((a, b) => b - a);
  }, [mealPlans]);

  const handleWeekClick = (weekKey: string) => {
    if (copyingFromWeek) {
      // If we're in copy mode, this is the target week
      if (copyingFromWeek !== weekKey && onCopyWeek) {
        onCopyWeek(copyingFromWeek, weekKey);
        setCopyingFromWeek(null);
      }
    } else {
      // Normal selection
      onWeekSelect(weekKey);
      onOpenChange(false);
    }
  };

  const handleCopyClick = (e: React.MouseEvent, weekKey: string) => {
    e.stopPropagation();
    setCopyingFromWeek(weekKey);
  };

  const handleCancelCopy = () => {
    setCopyingFromWeek(null);
  };

  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long' });
  const isCurrentMonth = selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth();

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Week</DialogTitle>
        </DialogHeader>

        {/* Year selector */}
        <div className="flex gap-2 flex-wrap pb-4 border-b">
          {availableYears.map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedYear(year);
                const currentDate = new Date();
                if (year === currentDate.getFullYear()) {
                  setSelectedMonth(currentDate.getMonth());
                }
              }}
            >
              {year}
            </Button>
          ))}
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthName} {selectedYear}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Copy mode indicator */}
        {copyingFromWeek && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-900">
                Select a week to copy meal plans to
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelCopy}
                className="h-7"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Calendar grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {/* Week blocks - each week is a row */}
            {monthWeeks.map((weekBlock) => {
              const isSelected = weekBlock.weekKey === currentWeek;
              const isCurrent = isCurrentWeek(weekBlock.weekKey);
              const isCopying = copyingFromWeek === weekBlock.weekKey;
              const isCopyTarget = copyingFromWeek && copyingFromWeek !== weekBlock.weekKey;

              const weekRange = formatWeekRangeWithoutYear(weekBlock.year, weekBlock.week);
              const startDayName = weekBlock.startDate.toLocaleDateString('en-US', { weekday: 'short' });
              const endDayName = weekBlock.endDate.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div
                  key={weekBlock.weekKey}
                  className={cn(
                    "relative group",
                    isCopyTarget && "opacity-60"
                  )}
                >
                  {/* Week block */}
                  <div
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all",
                      "hover:shadow-md",
                      isSelected && "ring-2 ring-primary border-primary",
                      isCurrent && "bg-primary/5 border-primary/20",
                      isCopying && "bg-blue-50 border-blue-300",
                      isCopyTarget && "border-dashed border-blue-300 hover:border-blue-400",
                      !isSelected && !isCurrent && "border-gray-200 bg-white"
                    )}
                    onClick={() => handleWeekClick(weekBlock.weekKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {weekRange}
                            <span className="text-gray-500 font-normal ml-1.5">
                              {startDayName} → {endDayName}
                            </span>
                          </div>
                          {weekBlock.mealCount > 0 && (
                            <div className="flex items-center gap-2 mt-1.5">
                              {/* Meal plan blocks indicator */}
                              <div className="flex gap-1">
                                {Array.from({ length: Math.min(weekBlock.mealCount, 8) }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-[#48A97D]"
                                  />
                                ))}
                                {weekBlock.mealCount > 8 && (
                                  <span className="text-xs text-muted-foreground">+{weekBlock.mealCount - 8}</span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {weekBlock.mealCount} meal{weekBlock.mealCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {weekBlock.mealCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleCopyClick(e, weekBlock.weekKey)}
                            title="Copy meal plans from this week"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full whitespace-nowrap">
                            Current
                          </span>
                        )}
                        {isSelected && !isCurrent && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {monthWeeks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No weeks found for {monthName} {selectedYear}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

