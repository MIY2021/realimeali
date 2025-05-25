
import { Button } from "@/components/ui/button";
import { ListChecks, Share, FileSpreadsheet, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface MealPlannerActionsProps {
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  isLoading: boolean;
}

export const MealPlannerActions = ({ 
  onRandomize, 
  onShare, 
  onClearAll, 
  isLoading 
}: MealPlannerActionsProps) => {
  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          onClick={onRandomize}
          size="sm"
          className="bg-sage hover:bg-sage/90 flex items-center whitespace-nowrap flex-1"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Randomise
        </Button>
        <Button
          onClick={onShare}
          size="sm"
          variant="outline"
          className="flex items-center whitespace-nowrap flex-1"
        >
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
      
      <div className="flex gap-2 items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          className="text-terracotta border-terracotta hover:bg-terracotta/10 flex-1"
          onClick={onClearAll}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear All
        </Button>
        <Button asChild variant="outline" size="sm" className="flex items-center flex-1">
          <Link to="/shopping-list" className="flex items-center">
            <ListChecks className="mr-2 h-4 w-4" />
            Shopping List
          </Link>
        </Button>
      </div>
    </>
  );
};
