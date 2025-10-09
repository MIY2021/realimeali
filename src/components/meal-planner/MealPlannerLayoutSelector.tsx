import { LayoutList, Grid2X2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealPlannerLayoutSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MealPlannerLayoutSelector({ value, onChange }: MealPlannerLayoutSelectorProps) {
  const isGridView = value === "2";
  
  return (
    <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("list")}
        className={`h-7 w-7 p-0 ${
          value === "list" 
            ? "bg-white shadow-sm" 
            : "hover:bg-gray-100"
        }`}
      >
        <LayoutList className="h-4 w-4 text-gray-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("2")}
        className={`h-7 w-7 p-0 ${
          isGridView 
            ? "bg-white shadow-sm border border-sage" 
            : "hover:bg-gray-100"
        }`}
      >
        <Grid2X2 className="h-4 w-4 text-gray-600" />
      </Button>
    </div>
  );
}