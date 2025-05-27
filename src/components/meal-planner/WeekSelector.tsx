
import { Button } from "@/components/ui/button";
import { Share, Trash2 } from "lucide-react";

interface WeekSelectorProps {
  week: 1 | 2;
  onWeekChange: (week: 1 | 2) => void;
  onShare: () => void;
  onClearAll: () => void;
  isLoading?: boolean;
}

export const WeekSelector = ({ 
  week, 
  onWeekChange, 
  onShare, 
  onClearAll, 
  isLoading = false 
}: WeekSelectorProps) => {
  return (
    <div className="flex justify-between items-center gap-2 mb-4">
      <div className="flex gap-2">
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
      
      <div className="flex gap-2">
        <Button
          onClick={onShare}
          size="sm"
          variant="outline"
          className="flex items-center"
          disabled={isLoading}
        >
          <Share className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-terracotta border-terracotta hover:bg-terracotta/10 flex items-center"
          onClick={onClearAll}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
