import { LayoutList, Grid2X2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MealPlannerLayoutSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MealPlannerLayoutSelector({ value, onChange }: MealPlannerLayoutSelectorProps) {
  const isGridView = value === "2";
  
  return (
    <TooltipProvider>
      <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("list")}
              className={`h-9 w-9 p-0 transition-all ${
                value === "list" 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>List View</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("2")}
              className={`h-9 w-9 p-0 transition-all ${
                isGridView 
                  ? "bg-white shadow-sm text-gray-900" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Grid View</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}