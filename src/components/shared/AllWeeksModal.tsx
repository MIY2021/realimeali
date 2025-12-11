import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  parseISOWeekKey, 
  formatWeekRange, 
  getCurrentWeekKey,
  isCurrentWeek,
  isPastWeek,
  compareWeekKeys,
  getISOWeekKey
} from "@/utils/weekUtils";
import { Check, Calendar } from "lucide-react";
import { MealPlan } from "@/types";
import { cn } from "@/lib/utils";

interface AllWeeksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWeek: string; // ISO week key
  onWeekSelect: (week: string) => void;
  mealPlans: MealPlan[]; // All meal plans to group by week
}

interface WeekSummary {
  weekKey: string;
  year: number;
  week: number;
  mealCount: number;
  formattedRange: string;
}

export function AllWeeksModal({
  open,
  onOpenChange,
  currentWeek,
  onWeekSelect,
  mealPlans,
}: AllWeeksModalProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Group meal plans by week
  const weekSummaries = useMemo(() => {
    const weekMap = new Map<string, number>();
    
    // Count meals per week
    mealPlans.forEach((plan) => {
      // Use week_key if available, otherwise calculate from date
      const weekKey = plan.week_key || getISOWeekKey(new Date(plan.date));
      
      weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
    });

    // Convert to array of summaries
    const summaries: WeekSummary[] = [];
    weekMap.forEach((mealCount, weekKey) => {
      try {
        const { year, week } = parseISOWeekKey(weekKey);
        summaries.push({
          weekKey,
          year,
          week,
          mealCount,
          formattedRange: formatWeekRange(year, week),
        });
      } catch (e) {
        console.error(`Invalid week key: ${weekKey}`, e);
      }
    });

    // Sort by year and week
    summaries.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year; // Most recent first
      return b.week - a.week;
    });

    return summaries;
  }, [mealPlans]);

  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = new Set(weekSummaries.map((s) => s.year));
    // Also include current year and a few future/past years for navigation
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    years.add(currentYear + 1);
    return Array.from(years).sort((a, b) => b - a);
  }, [weekSummaries]);

  // Filter weeks by selected year
  const filteredWeeks = useMemo(() => {
    if (selectedYear === null) return weekSummaries;
    return weekSummaries.filter((s) => s.year === selectedYear);
  }, [weekSummaries, selectedYear]);

  const handleWeekClick = (weekKey: string) => {
    onWeekSelect(weekKey);
    onOpenChange(false);
  };

  // Group weeks by year for display
  const weeksByYear = useMemo(() => {
    const grouped = new Map<number, WeekSummary[]>();
    filteredWeeks.forEach((summary) => {
      if (!grouped.has(summary.year)) {
        grouped.set(summary.year, []);
      }
      grouped.get(summary.year)!.push(summary);
    });
    return grouped;
  }, [filteredWeeks]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Week</DialogTitle>
        </DialogHeader>

        {/* Year filter */}
        <div className="flex gap-2 flex-wrap pb-4 border-b">
          <Button
            variant={selectedYear === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedYear(null)}
          >
            All Years
          </Button>
          {availableYears.map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </Button>
          ))}
        </div>

        {/* Scrollable week list */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-6">
          {Array.from(weeksByYear.entries())
            .sort((a, b) => b[0] - a[0]) // Most recent year first
            .map(([year, weeks]) => (
              <div key={year}>
                <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2 z-10">
                  {year}
                </h3>
                <div className="space-y-2">
                  {weeks
                    .sort((a, b) => b.week - a.week) // Most recent week first
                    .map((summary) => {
                      const isSelected = summary.weekKey === currentWeek;
                      const isCurrent = isCurrentWeek(summary.weekKey);
                      const isPast = isPastWeek(summary.weekKey);
                      const isFuture = !isCurrent && !isPast;

                      return (
                        <Card
                          key={summary.weekKey}
                          className={cn(
                            "p-4 cursor-pointer transition-all hover:shadow-md",
                            isSelected && "ring-2 ring-primary",
                            isCurrent && "bg-primary/5 border-primary/20",
                            isPast && "opacity-75"
                          )}
                          onClick={() => handleWeekClick(summary.weekKey)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  Week {summary.week} - {summary.formattedRange}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {summary.mealCount} meal
                                  {summary.mealCount !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCurrent && (
                                <Badge variant="default">Current</Badge>
                              )}
                              {isPast && (
                                <Badge variant="secondary" className="gap-1">
                                  <Check className="h-3 w-3" />
                                  Completed
                                </Badge>
                              )}
                              {isFuture && summary.mealCount === 0 && (
                                <Badge variant="outline">Empty</Badge>
                              )}
                              {isSelected && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>

        {/* Empty state */}
        {filteredWeeks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {selectedYear
                ? `No meal plans found for ${selectedYear}`
                : "No meal plans found"}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

