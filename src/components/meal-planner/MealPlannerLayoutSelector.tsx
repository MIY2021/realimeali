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
      <div className="flex gap-1 bg-gray-50 rounded-[12px] p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onChange("list")}
              className={`h-9 w-9 p-0 ${
                value === "list" 
                  ? "bg-white shadow-sm" 
                  : ""
              }`}
            >
              <LayoutList className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>List View</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onChange("2")}
              className={`h-9 w-9 p-0 ${
                isGridView 
                  ? "bg-white shadow-sm" 
                  : ""
              }`}
            >
              <Grid2X2 className="h-5 w-5 text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Grid View</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}