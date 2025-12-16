import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { 
  parseISOWeekKey, 
  formatWeekRangeWithoutYear, 
  getPreviousWeek, 
  getNextWeek,
  getCurrentWeekKey,
  isCurrentWeek,
  getWeekStartDate,
  getWeekEndDate
} from "@/utils/weekUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeekSelectorProps {
  currentWeek: string; // ISO week key format: "YYYY-Www"
  onWeekChange: (week: string) => void;
  onWeekClick?: () => void; // Opens the "All Weeks" modal
  isLoading?: boolean;
}

export function WeekSelector({ 
  currentWeek, 
  onWeekChange, 
  onWeekClick,
  isLoading = false 
}: WeekSelectorProps) {
  const isMobile = useIsMobile();
  
  const handlePrevious = () => {
    if (isLoading) return;
    const prevWeek = getPreviousWeek(currentWeek);
    onWeekChange(prevWeek);
  };
  
  const handleNext = () => {
    if (isLoading) return;
    const nextWeek = getNextWeek(currentWeek);
    onWeekChange(nextWeek);
  };
  
  const handleWeekClick = () => {
    if (onWeekClick && !isLoading) {
      onWeekClick();
    }
  };
  
  const handleCurrentWeek = () => {
    if (isLoading) return;
    const currentWeekKey = getCurrentWeekKey();
    onWeekChange(currentWeekKey);
  };
  
  // Parse week key to get year and week for formatting
  const { year, week } = parseISOWeekKey(currentWeek);
  const weekRange = formatWeekRangeWithoutYear(year, week);
  const isCurrentlyOnCurrentWeek = isCurrentWeek(currentWeek);
  
  // Get start (Monday) and end (Sunday) dates for day names
  const weekStartDate = getWeekStartDate(year, week);
  const weekEndDate = getWeekEndDate(year, week);
  const startDayName = weekStartDate.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"
  const endDayName = weekEndDate.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Sun"
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="md"
        onClick={handleCurrentWeek}
        disabled={isLoading || isCurrentlyOnCurrentWeek}
        className="px-3"
        aria-label="Go to current week"
        title="Go to current week"
      >
        <Calendar className="h-4 w-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="md"
        onClick={handlePrevious}
        disabled={isLoading}
        className="px-3"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="md"
        onClick={handleWeekClick}
        disabled={isLoading || !onWeekClick}
        className={`min-w-[180px] ${onWeekClick ? 'cursor-pointer hover:bg-gray-100' : ''}`}
        aria-label="Select week"
      >
        <span className="font-medium text-sm whitespace-nowrap">
          {weekRange}
          <span className="text-gray-500 font-normal ml-1.5">{startDayName} → {endDayName}</span>
        </span>
      </Button>
      
      <Button
        variant="secondary"
        size="md"
        onClick={handleNext}
        disabled={isLoading}
        className="px-3"
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

