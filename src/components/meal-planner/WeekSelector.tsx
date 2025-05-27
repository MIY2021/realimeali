
import { Button } from "@/components/ui/button";

interface WeekSelectorProps {
  week: 1 | 2;
  onWeekChange: (week: 1 | 2) => void;
  isLoading?: boolean;
}

export const WeekSelector = ({ 
  week, 
  onWeekChange, 
  isLoading = false 
}: WeekSelectorProps) => {
  return (
    <div className="flex justify-start items-center gap-2 mb-4">
      <div className="flex gap-2">
        {[1, 2].map((val) => (
          <Button
            key={val}
            size="sm"
            variant={week === val ? "default" : "outline"}
            className={week === val ? "bg-terracotta text-white" : ""}
            onClick={() => onWeekChange(val as 1 | 2)}
            disabled={isLoading}
          >
            Week {val}
          </Button>
        ))}
      </div>
    </div>
  );
};
