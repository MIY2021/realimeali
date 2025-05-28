
import { Button } from "@/components/ui/button";
import { ListChecks, FileSpreadsheet, Share, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface MealPlannerActionsProps {
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  currentWeek: 1 | 2;
}

export const MealPlannerActions = ({ 
  onRandomize, 
  onShare,
  onClearAll,
  isLoading
}: MealPlannerActionsProps) => {
  return (
    <>
      {/* Desktop: Generate Meal Plan and Shopping List on same row */}
      <div className="hidden sm:flex gap-4 mb-4">
        <Button
          onClick={onRandomize}
          className="bg-sage hover:bg-sage/90 flex items-center whitespace-nowrap flex-1"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Generate Meal Plan
        </Button>
        
        <Button asChild variant="outline" className="flex items-center flex-1">
          <Link to="/shopping-list" className="flex items-center">
            <ListChecks className="mr-2 h-4 w-4" />
            Shopping List
          </Link>
        </Button>
      </div>

      {/* Mobile: Stacked buttons */}
      <div className="sm:hidden space-y-2 mb-4">
        <Button
          onClick={onRandomize}
          size="sm"
          className="bg-sage hover:bg-sage/90 flex items-center whitespace-nowrap w-full"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Generate Meal Plan
        </Button>
        
        <Button asChild variant="outline" size="sm" className="flex items-center w-full">
          <Link to="/shopping-list" className="flex items-center">
            <ListChecks className="mr-2 h-4 w-4" />
            Shopping List
          </Link>
        </Button>
      </div>
      
      {/* Share and Clear buttons row */}
      <div className="flex gap-2 mb-4">
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
    </>
  );
};
