
import { Button } from "@/components/ui/button";

interface WeekSelectorProps {
  week: 1 | 2;
  onWeekChange: (week: 1 | 2) => void;
}

export const WeekSelector = ({ week, onWeekChange }: WeekSelectorProps) => {
  return (
    <div className="flex gap-2 mb-4">
      {[1, 2].map((val) => (
        <Button
          key={val}
          size="sm"
          variant={week === val ? "default" : "outline"}
          className={week === val ? "bg-terracotta text-white" : ""}
          onClick={() => onWeekChange(val as 1 | 2)}
        >
          Week {val}
        </Button>
      ))}
    </div>
  );
};
