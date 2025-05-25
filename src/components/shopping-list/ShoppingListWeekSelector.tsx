
import { Button } from "@/components/ui/button";

interface ShoppingListWeekSelectorProps {
  selectedWeek: 1 | 2;
  onWeekSelect: (week: 1 | 2) => void;
}

export default function ShoppingListWeekSelector({ 
  selectedWeek, 
  onWeekSelect 
}: ShoppingListWeekSelectorProps) {
  return (
    <div className="flex gap-2 mb-4">
      {[1, 2].map((week) => (
        <Button
          key={week}
          size="sm"
          variant={selectedWeek === week ? "default" : "outline"}
          className={selectedWeek === week ? "bg-terracotta text-white" : ""}
          onClick={() => onWeekSelect(week as 1 | 2)}
        >
          Week {week}
        </Button>
      ))}
    </div>
  );
}
