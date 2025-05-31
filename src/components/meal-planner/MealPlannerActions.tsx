
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
    <div className="space-y-3">
      {/* Generate Meal Plan - Full width on its own row */}
      <Button
        onClick={onRandomize}
        className="bg-sage hover:bg-sage/90 flex items-center justify-center w-full"
        disabled={isLoading}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Generate Meal Plan
      </Button>

      {/* Desktop: Shopping List, Share, and Clear buttons on same row */}
      <div className="hidden sm:flex gap-3">
        <Button asChild variant="outline" className="flex items-center flex-1">
          <Link to="/shopping-list" className="flex items-center justify-center">
            <ListChecks className="mr-2 h-4 w-4" />
            Shopping List
          </Link>
        </Button>

        <Button
          onClick={onShare}
          variant="outline"
          className="flex items-center px-4"
          disabled={isLoading}
        >
          <Share className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          className="text-terracotta border-terracotta hover:bg-terracotta/10 flex items-center px-4"
          onClick={onClearAll}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="sm:hidden space-y-2">
        <Button asChild variant="outline" size="sm" className="flex items-center w-full">
          <Link to="/shopping-list" className="flex items-center justify-center">
            <ListChecks className="mr-2 h-4 w-4" />
            Shopping List
          </Link>
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={onShare}
            size="sm"
            variant="outline"
            className="flex items-center justify-center flex-1"
            disabled={isLoading}
          >
            <Share className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-terracotta border-terracotta hover:bg-terracotta/10 flex items-center justify-center flex-1"
            onClick={onClearAll}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
