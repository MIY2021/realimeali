import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  parseISOWeekKey, 
  formatWeekRange, 
  getPreviousWeek, 
  getNextWeek 
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
  
  // Parse week key to get year and week for formatting
  const { year, week } = parseISOWeekKey(currentWeek);
  const weekRange = formatWeekRange(year, week);
  
  return (
    <div className="flex items-center gap-2">
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
        className={`flex-1 ${onWeekClick ? 'cursor-pointer hover:bg-gray-100' : ''}`}
        aria-label="Select week"
      >
        <span className="font-medium">Week of {weekRange}</span>
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

